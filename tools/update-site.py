#!/usr/bin/env python3
"""Run this after you change data/projects.js (or add/replace a download file).

What it does
  1. Checks your data (unique ids, files and screenshots exist, release names, ...).
  2. Writes data/sizes.js with the size of every download (files on disk + GitHub Release assets),
     so the site can show file sizes without you typing them.
  3. Rewrites sitemap.xml.
  4. Refreshes the generated SEO blocks inside index.html and project.html
     (structured data + the plain link list for visitors/crawlers without JavaScript), and the structured data of about.html.
  5. Makes a small share page per project in share/<id>/index.html. Chat apps (Discord, Reddit, ...) don't run
     JavaScript, so they show the project's own title, text and cover image when you post THIS link
     (https://.../share/<id>/). Visitors who open it are forwarded to the real project page.

Usage:   python tools/update-site.py            (checks GitHub for Release sizes too)
         python tools/update-site.py --offline  (skips the GitHub lookups, keeps old Release sizes)
"""
from __future__ import annotations
import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _sitedata import ROOT, js_const, load_site  # noqa: E402

STATUSES = {"released", "in-development", "planned", "on-hold", "archived"}
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
problems: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    problems.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def release_size(repo: str, tag: str, asset: str) -> int | None:
    """Total size of a Release asset: ask for 1 byte and read the Content-Range header."""
    url = f"https://github.com/{repo}/releases/download/{quote(tag, safe='')}/{quote(asset, safe='')}"
    req = urllib.request.Request(url, headers={"Range": "bytes=0-0", "User-Agent": "supgamernl-site-tools"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            total = (resp.headers.get("Content-Range") or "").rsplit("/", 1)[-1]
            if total.isdigit():
                return int(total)
            length = resp.headers.get("Content-Length")
            return int(length) if length and length.isdigit() and resp.status == 200 else None
    except (urllib.error.URLError, TimeoutError, OSError):
        return None


def validate(site: dict) -> None:
    ids = set()
    for p in site["projects"]:
        pid = p.get("id", "")
        where = f'project "{pid or "?"}"'
        for field in ("id", "name", "category", "description"):
            if not p.get(field):
                err(f"{where}: missing `{field}`")
        if pid and not ID_RE.match(pid):
            err(f'{where}: id should be lowercase letters, numbers and dashes only')
        if pid in ids:
            err(f"{where}: id is used twice")
        ids.add(pid)
        if p.get("status") and p["status"] not in STATUSES:
            err(f'{where}: status "{p["status"]}" is not one of {sorted(STATUSES)}')
        for link in p.get("links", []):
            if not link.get("label") or not link.get("url"):
                err(f"{where}: every link needs a label and a url")
        for d in p.get("downloads", []):
            label = d.get("label", "?")
            if not d.get("file") and not d.get("release"):
                err(f'{where}: download "{label}" has neither `file` nor `release`')
            if d.get("file") and not (ROOT / d["file"]).is_file():
                err(f'{where}: download file not found: {d["file"]}')
            rel = d.get("release")
            if rel:
                if not rel.get("tag") or not rel.get("asset"):
                    err(f'{where}: download "{label}": release needs a tag and an asset')
                elif " " in rel["asset"]:
                    warn(f'{where}: release asset "{rel["asset"]}" has spaces; GitHub turns them into dots, so use the exact name shown on the Release page')
                if not site["releases_live"]:
                    warn(f'{where}: "{label}" has a release, but RELEASES_LIVE is false so its button stays hidden')
        folder = ROOT / "assets" / "img" / pid
        for g in p.get("gallery", []):
            for sub in ("", "thumbs/"):
                if not (folder / (sub + g.get("file", ""))).is_file():
                    err(f'{where}: screenshot missing: assets/img/{pid}/{sub}{g.get("file")}')
        cover = p.get("cover")
        if cover:
            for sub in ("", "thumbs/"):
                if not (folder / (sub + cover)).is_file():
                    err(f'{where}: cover missing: assets/img/{pid}/{sub}{cover}')
        for row in p.get("support", []):
            if not (row.get("game") or row.get("engine")):
                err(f"{where}: every `support` row needs a `game` or an `engine`")
        for c in p.get("changelog", []):
            if not c.get("version") or not c.get("changes"):
                err(f"{where}: every changelog entry needs a `version` and a `changes` list")
        for t in p.get("timeline", []):
            if not t.get("date") or not t.get("title"):
                err(f"{where}: every timeline entry needs a `date` and a `title`")


def collect_sizes(site: dict, offline: bool) -> dict[str, int]:
    path = ROOT / "data" / "sizes.js"
    old: dict[str, int] = {}
    if path.is_file():
        try:
            old = js_const(path.read_text(encoding="utf-8"), "FILE_SIZES")
        except SystemExit:
            old = {}
    sizes: dict[str, int] = {}
    for p in site["projects"]:
        for d in p.get("downloads", []):
            if d.get("file") and (ROOT / d["file"]).is_file():
                sizes[d["file"]] = (ROOT / d["file"]).stat().st_size
            rel = d.get("release")
            if rel and rel.get("tag") and rel.get("asset"):
                key = f'release:{rel["tag"]}/{rel["asset"]}'
                got = None if offline else release_size(site["releases_repo"], rel["tag"], rel["asset"])
                if got:
                    sizes[key] = got
                elif key in old:
                    sizes[key] = old[key]
                    warn(f'Could not reach GitHub for {key}; kept the old size' if not offline else "")
                else:
                    warn(f"No size known for {key} (is the Release published? is the asset name exact?)")
    return {k: v for k, v in sizes.items()}


def write_sizes(sizes: dict[str, int]) -> None:
    lines = [
        "// Generated by tools/update-site.py. Do not edit by hand.",
        "// Sizes in bytes of every download: files in this repo and GitHub Release assets.",
        "// The site also re-checks files live in the browser, so this is the fallback.",
        "const FILE_SIZES = {",
    ]
    items = sorted(sizes.items())
    for i, (k, v) in enumerate(items):
        lines.append(f"  {json.dumps(k, ensure_ascii=False)}: {v}" + ("," if i < len(items) - 1 else ""))
    lines.append("};")
    (ROOT / "data" / "sizes.js").write_text("\n".join(lines) + "\n", encoding="utf-8")


def project_url(site: dict, pid: str) -> str:
    return site["site"]["url"] + "project.html?id=" + quote(pid, safe="")


def write_sitemap(site: dict) -> None:
    base = site["site"]["url"]
    urls = [base, base + "about.html", base + "gallery.html"] + [project_url(site, p["id"]) for p in site["projects"]]
    body = "\n".join(f"  <url><loc>{html.escape(u)}</loc></url>" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n",
        encoding="utf-8")


def replace_block(text: str, name: str, content: str) -> str:
    pat = re.compile(rf"(<!-- {name}:start[^>]*-->)(.*?)(<!-- {name}:end -->)", re.S)
    if not pat.search(text):
        raise SystemExit(f"Marker <!-- {name}:start --> ... <!-- {name}:end --> not found")
    return pat.sub(lambda m: m.group(1) + "\n" + content + "\n" + m.group(3), text, count=1)


def ld_script(obj: dict) -> str:
    return '<script type="application/ld+json" id="ld-site">' + json.dumps(obj, ensure_ascii=False).replace("</", "<\\/") + "</script>"


def update_html(site: dict) -> None:
    cfg, base = site["site"], site["site"]["url"]
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebSite", "@id": base + "#website", "name": cfg["name"], "url": base,
             "description": "Minecraft mods, maps and indie game projects by Jelle Koerselman.", "inLanguage": "en",
             "publisher": {"@id": base + "#person"},
             "potentialAction": {"@type": "SearchAction",
                                 "target": {"@type": "EntryPoint", "urlTemplate": base + "?q={search_term_string}"},
                                 "query-input": "required name=search_term_string"}},
            {"@type": "Person", "@id": base + "#person", "name": cfg["author"], "alternateName": cfg["name"], "url": base,
             "sameAs": [p["url"] for p in site["profiles"]]},
            {"@type": "ItemList", "name": "Creations by " + cfg["name"], "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": p["name"], "url": project_url(site, p["id"])}
                for i, p in enumerate(site["projects"])]},
        ],
    }
    items = "\n".join(
        f'    <li><a href="project.html?id={html.escape(quote(p["id"], safe=""))}">{html.escape(p["name"])}</a>: {html.escape(p["description"])}</li>'
        for p in site["projects"])
    nolist = ("<noscript>\n  <section class=\"about\">\n    <h2>All creations</h2>\n    <p>This page works best with JavaScript turned on. Here are all my creations:</p>\n"
              "    <ul>\n" + items + "\n    </ul>\n  </section>\n</noscript>")

    index = ROOT / "index.html"
    text = replace_block(index.read_text(encoding="utf-8"), "ld", ld_script(graph))
    index.write_text(replace_block(text, "list", nolist), encoding="utf-8")

    about = ROOT / "about.html"
    if about.is_file():
        profile = {
            "@context": "https://schema.org",
            "@type": "ProfilePage", "@id": base + "about.html#profile", "url": base + "about.html",
            "name": "About " + cfg["name"], "inLanguage": "en", "isPartOf": {"@id": base + "#website"},
            "mainEntity": {"@type": "Person", "@id": base + "#person", "name": cfg["author"], "alternateName": cfg["name"], "url": base,
                           "description": "IT specialist from the Netherlands who builds PCs, develops mods and add-ons and makes simple RPG games.",
                           "sameAs": [p["url"] for p in site["profiles"]]},
        }
        about.write_text(replace_block(about.read_text(encoding="utf-8"), "ld", ld_script(profile)), encoding="utf-8")

    proj = ROOT / "project.html"
    proj.write_text(replace_block(proj.read_text(encoding="utf-8"), "list", nolist), encoding="utf-8")


SHARE_MARK = "<!-- generated by tools/update-site.py (share page) -->"


def cover_file(p: dict) -> str | None:
    """Same rule as the site: the explicit cover, else the first screenshot."""
    return p.get("cover") or (p.get("gallery") or [{}])[0].get("file")


def share_page(site: dict, p: dict) -> str:
    base = site["site"]["url"]
    esc = lambda t: html.escape(str(t), quote=True)
    pid = p["id"]
    target = f"../../project.html?id={quote(pid, safe='')}"
    canonical = project_url(site, pid)
    share_url = f"{base}share/{quote(pid, safe='')}/"
    cf = cover_file(p)
    image = f"{base}assets/img/{quote(pid, safe='')}/{quote(cf, safe='')}" if cf else base + site["site"]["image"]
    alt = f'{p["name"]} screenshot' if cf else site["site"].get("imageAlt", "")
    title = f'{p["name"]} | {site["site"]["name"]}'
    card = "summary_large_image" if cf else "summary"
    return f"""<!DOCTYPE html>
{SHARE_MARK}
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(p['description'])}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{esc(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="{esc(site['site']['name'])}">
<meta property="og:locale" content="en">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(p['description'])}">
<meta property="og:url" content="{esc(share_url)}">
<meta property="og:image" content="{esc(image)}">
<meta property="og:image:alt" content="{esc(alt)}">
<meta name="twitter:card" content="{card}">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(p['description'])}">
<meta name="twitter:image" content="{esc(image)}">
<meta http-equiv="refresh" content="0; url={esc(target)}">
<script>location.replace({json.dumps(target)});</script>
<style>body{{margin:0;padding:3rem 1.5rem;background:#05090a;color:#f4fffd;font:1rem/1.6 "Trebuchet MS","Segoe UI",system-ui,sans-serif}}a{{color:#7fffd4}}</style>
</head>
<body>
<h1>{esc(p['name'])}</h1>
<p>{esc(p['description'])}</p>
<p><a href="{esc(target)}">Open the project page</a></p>
</body>
</html>
"""


def write_share_pages(site: dict) -> int:
    root = ROOT / "share"
    ids = {p["id"] for p in site["projects"]}
    for p in site["projects"]:
        d = root / p["id"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(share_page(site, p), encoding="utf-8")
    # remove share pages of projects that no longer exist (only ones this tool made)
    if root.is_dir():
        for d in root.iterdir():
            f = d / "index.html"
            if d.is_dir() and d.name not in ids and f.is_file() and SHARE_MARK in f.read_text(encoding="utf-8"):
                f.unlink()
                d.rmdir()
    return len(ids)


def main() -> int:
    ap = argparse.ArgumentParser(description="Check the data and regenerate sizes, sitemap and SEO blocks.")
    ap.add_argument("--offline", action="store_true", help="skip GitHub lookups")
    args = ap.parse_args()

    site = load_site()
    validate(site)
    sizes = collect_sizes(site, args.offline)
    if not problems:
        write_sizes(sizes)
        write_sitemap(site)
        update_html(site)
        shared = write_share_pages(site)

    for w in filter(None, warnings):
        print("  warning:", w)
    for e in problems:
        print("  ERROR:  ", e)
    if problems:
        print(f"\n{len(problems)} problem(s) found, so nothing was written. Fix them and run again.")
        return 1
    print(f"OK: {len(site['projects'])} projects checked, {len(sizes)} download sizes written to data/sizes.js, sitemap.xml, the SEO blocks and {shared} share pages updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
