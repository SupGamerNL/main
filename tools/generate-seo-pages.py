#!/usr/bin/env python3
"""Generate crawlable project pages and sitemap from data/projects.js.

Uses only the Python standard library. The website itself remains static and
does not need Python, Node, a build step, or a backend when hosted.
"""
from __future__ import annotations
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://supgamernl.github.io/main/"
AUTHOR = 'Jelle "SupGamer NL" Koerselman'
SHARE_IMAGE = SITE + "assets/img/icon-image.png"


def strip_comments(source: str) -> str:
    """Remove JS line/block comments without touching quoted strings."""
    out, i, quote_char = [], 0, None
    while i < len(source):
        ch = source[i]
        if quote_char:
            out.append(ch)
            if ch == "\\" and i + 1 < len(source):
                i += 1
                out.append(source[i])
            elif ch == quote_char:
                quote_char = None
            i += 1
            continue
        if ch in ("'", '"', "`"):
            quote_char = ch
            out.append(ch)
            i += 1
        elif source.startswith("//", i):
            end = source.find("\n", i)
            i = len(source) if end < 0 else end
        elif source.startswith("/*", i):
            end = source.find("*/", i + 2)
            i = len(source) if end < 0 else end + 2
        else:
            out.append(ch)
            i += 1
    return "".join(out)


def project_data() -> tuple[list[dict], str, bool]:
    source = strip_comments((ROOT / "data/projects.js").read_text(encoding="utf-8"))
    repo_match = re.search(r"""\bconst\s+RELEASES_REPO\s*=\s*["']([^"']+)["']""", source)
    live_match = re.search(r"\bconst\s+RELEASES_LIVE\s*=\s*(true|false)", source)
    releases_repo = repo_match.group(1) if repo_match else "SupGamerNL/main"
    releases_live = live_match.group(1) == "true" if live_match else False
    marker = re.search(r"\bconst\s+PROJECTS\s*=\s*", source)
    if not marker:
        raise SystemExit("Could not find `const PROJECTS = [...]` in data/projects.js")
    start = source.find("[", marker.end())
    depth, quote_char, escaped, end = 0, None, False, None
    for pos in range(start, len(source)):
        ch = source[pos]
        if quote_char:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote_char:
                quote_char = None
            continue
        if ch in ("'", '"', "`"):
            quote_char = ch
        elif ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
            if depth == 0:
                end = pos + 1
                break
    if end is None:
        raise SystemExit("Could not find the end of the PROJECTS array")
    js = source[start:end]
    # The project data is a JSON-compatible JavaScript literal (unquoted keys
    # and optional trailing commas are the only syntax differences).
    js = re.sub(r'(?<=[{,])\s*([A-Za-z_$][\w$]*)\s*:', r'"\1":', js)
    js = re.sub(r",\s*([}\]])", r"\1", js)
    try:
        data = json.loads(js)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse PROJECTS data: {exc}") from exc
    if not isinstance(data, list):
        raise SystemExit("PROJECTS must be an array")
    return data, releases_repo, releases_live


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def meta(title: str, description: str, canonical: str) -> str:
    return f"""<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="SupGamer NL">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:image" content="{SHARE_IMAGE}">
<meta property="og:image:alt" content="SupGamer NL profile artwork">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{SHARE_IMAGE}">"""


def page(project: dict, releases_repo: str, releases_live: bool) -> str:
    pid = project["id"]
    name = project["name"]
    description = project["description"]
    canonical = SITE + f"projects/{quote(pid)}/"
    page_data = project.get("page") or {}
    schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": name,
        "description": description,
        "url": canonical,
        "creator": {"@type": "Person", "name": AUTHOR},
        "genre": project.get("category", ""),
        "keywords": project.get("tags", []),
        "image": SHARE_IMAGE,
    }
    parts = [f"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="author" content="{esc(AUTHOR)}">
<meta name="copyright" content="© 2026 Jelle &quot;SupGamer NL&quot; Koerselman. All rights reserved.">
{meta(name + " | SupGamer NL", description, canonical)}
<link rel="icon" type="image/png" href="../../assets/img/icon-image.png">
<link rel="stylesheet" href="../../assets/css/style.css">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head><body>""",
"""<div class="pulse" aria-hidden="true"></div><div class="pulse b" aria-hidden="true"></div>
<nav class="nav" aria-label="Main"><div class="nav-in">
<a class="nav-brand" href="../../index.html"><span class="blocks" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>SupGamer NL</span></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menu"><span></span><span></span><span></span></button>
<ul class="nav-links" id="nav-links"><li><a href="../../index.html" aria-current="page">Creations</a></li><li><a href="../../gallery.html">Gallery</a></li><li><a href="../../index.html#about">About</a></li></ul>
</div></nav>""",
'<main id="project" class="project">',
'<a class="back" href="../../index.html">Back to all creations</a>',
f"<h1>{esc(name)}</h1>",
'<div class="meta">' + "".join(f'<span class="tag">{esc(tag)}</span>' for tag in [project.get("category", "")] + project.get("tags", [])) + "</div>",
f'<p class="lead">{esc(page_data.get("intro") or description)}</p>']

    links = project.get("links") or []
    if links:
        parts.append('<div class="btns">' + "".join(
            f'<a class="btn" href="{esc(link["url"])}" rel="noopener noreferrer">{esc(link["label"])}</a>'
            for link in links) + "</div>")

    downloads = project.get("downloads") or []
    if downloads:
        parts.append('<section class="sec"><h2>Downloads</h2>')
        groups: dict[str, list] = {}
        for item in downloads:
            groups.setdefault(item.get("group", ""), []).append(item)
        for group, items in groups.items():
            if group:
                parts.append(f'<h3 class="dl-group">{esc(group)}</h3>')
            parts.append('<ul class="dls">')
            for item in items:
                note = " · ".join(str(x) for x in (item.get("note"), item.get("size")) if x)
                actions = []
                if item.get("file"):
                    href = "../../" + "/".join(quote(part, safe="") for part in item["file"].split("/"))
                    actions.append(f'<a class="btn" href="{esc(href)}">Download</a>')
                release = item.get("release")
                if release and releases_live:
                    tag = quote(release["tag"], safe="")
                    asset = quote(release["asset"], safe="")
                    asset_url = f"https://github.com/{releases_repo}/releases/download/{tag}/{asset}"
                    actions.append(f'<a class="btn alt" href="{esc(asset_url)}" rel="noopener noreferrer">GitHub Release</a>')
                    actions.append(f'<a class="dl-page" href="https://github.com/{releases_repo}/releases/tag/{tag}" rel="noopener noreferrer">Release page</a>')
                if not actions:
                    continue
                parts.append(f'<li class="dl"><div class="dl-info"><strong>{esc(item["label"])}</strong><span class="dl-sub">{esc(note)}</span></div><div class="dl-acts">{"".join(actions)}</div></li>')
            parts.append("</ul>")
        parts.append("</section>")

    gallery = project.get("gallery") or []
    if gallery:
        parts.append('<section class="sec"><h2>Screenshots</h2><ul class="shots">')
        for item in gallery:
            filename = item["file"]
            caption = item.get("caption") or name
            full = f"../../assets/img/{quote(pid)}/{quote(filename)}"
            thumb = f"../../assets/img/{quote(pid)}/thumbs/{quote(filename)}"
            parts.append(f'<li><a class="shot" href="{full}"><img src="{thumb}" alt="{esc(caption)}" loading="lazy" width="640" height="360"></a><p>{esc(caption)}</p></li>')
        parts.append("</ul></section>")

    versions = page_data.get("versions") or []
    if versions:
        parts.append('<section class="sec"><h2>Versions</h2><div class="versions">')
        for version in versions:
            parts.append(f'<div class="version"><h3>{esc(version["name"])}</h3><p class="range">{esc(version.get("range", ""))}</p><p>{esc(version.get("note", ""))}</p>')
            vlinks = version.get("links") or []
            if vlinks:
                parts.append('<div class="links">' + "".join(
                    f'<a href="{esc(link["url"])}" rel="noopener noreferrer">{esc(link["label"])}</a>'
                    for link in vlinks) + "</div>")
            parts.append("</div>")
        parts.append("</div></section>")

    for section in page_data.get("sections") or []:
        parts.append(f'<section class="sec"><h2>{esc(section["title"])}</h2>')
        if section.get("text"):
            parts.append(f'<p>{esc(section["text"])}</p>')
        chips = section.get("chips") or []
        if chips:
            parts.append('<div class="meta">' + "".join(f'<span class="tag">{esc(chip)}</span>' for chip in chips) + "</div>")
        parts.append("</section>")

    parts.extend(["</main>",
        '<footer><a href="../../index.html">Back to all creations</a> &nbsp; <a href="../../gallery.html">Gallery</a><br>© 2026 Jelle &quot;SupGamer NL&quot; Koerselman. All rights reserved.</footer>',
        '<script src="../../assets/js/nav.js" defer></script><script src="../../assets/js/spotlight.js" defer></script>',
        "</body></html>"])
    return "\n".join(parts) + "\n"


def main() -> None:
    projects, releases_repo, releases_live = project_data()
    urls = [SITE, SITE + "gallery.html"]
    for project in projects:
        target = ROOT / "projects" / project["id"] / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page(project, releases_repo, releases_live), encoding="utf-8")
        urls.append(SITE + f"projects/{quote(project['id'])}/")
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap.extend(f"  <url><loc>{url}</loc></url>" for url in urls)
    sitemap.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    print(f"Generated {len(projects)} project pages and sitemap.xml")


if __name__ == "__main__":
    main()
