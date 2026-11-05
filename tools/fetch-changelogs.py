#!/usr/bin/env python3
"""Pull the changelogs ("What's new") of your files from CurseForge and Modrinth into data/changelogs.js.

The site shows them in each project's "Changelog" section. A `changelog` you type into data/projects.js always wins
over what this tool fetched, so nothing you wrote by hand is ever replaced.

Which pages are read: the CurseForge / Modrinth links already in each project's `links` list. Nothing to configure.

Usage
  python tools/fetch-changelogs.py                 all projects
  python tools/fetch-changelogs.py --only moat     one project id (can be repeated)
  python tools/fetch-changelogs.py --limit 5       newest 5 files per project (default 10)
  python tools/fetch-changelogs.py --dry-run       show what would be written, write nothing

CurseForge needs a free API key (one time):
  1. Apply for a key via the CurseForge for Studios console (the link is on CurseForge under Create > Apply for an API Key).
  2. Give it to the tool, either
        Windows (PowerShell):   $env:CURSEFORGE_API_KEY = "your key"
        or per run:             python tools/fetch-changelogs.py --curseforge-key "your key"
  Never put the key inside the repo or on the site.
Modrinth needs no key. Without a CurseForge key, CurseForge-only projects are skipped (the old data stays).

Afterwards run  python tools/update-site.py  as usual and upload data/changelogs.js.
"""
from __future__ import annotations
import argparse
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _sitedata import ROOT, js_const, load_site  # noqa: E402

CF_API = "https://api.curseforge.com/v1"
MR_API = "https://api.modrinth.com/v2"
MINECRAFT_GAME_ID = 432
UA = "SupGamerNL-site-tools/1.0 (https://github.com/SupGamerNL/main)"


def get_json(url: str, headers: dict | None = None):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


# ---------- turning changelog text into plain lines ----------
SECTION = re.compile(r"^([A-Za-z][A-Za-z ]{2,24}):$")
TAG = re.compile(r"^\[[A-Za-z]\]\s*")           # [A] [C] [R] markers
NOTHING = {"none", "-none", "n/a", "nothing", "-"}


def clean_lines(lines: list[str]) -> list[str]:
    """Strip bullets/markers, turn 'ADDED:' style headings into a prefix, drop empty and 'None' lines."""
    out, prefix = [], ""
    for raw in lines:
        t = re.sub(r"\s+", " ", raw).strip()
        t = re.sub(r"^[-*+\u2022]\s*", "", t)
        if not t:
            continue
        m = SECTION.match(t)
        if m and (t.upper() == t or t.istitle()):     # "ADDED:" / "Changed:" start a group
            prefix = m.group(1).capitalize() + ": "
            continue
        t = TAG.sub("", t).strip()
        if not t or t.lower() in NOTHING:
            continue
        out.append(prefix + t)
    return out


def html_to_lines(src: str) -> list[str]:
    s = re.sub(r"(?is)<(script|style).*?</\1>", "", src)
    s = re.sub(r"(?i)<li[^>]*>", "\n", s)
    s = re.sub(r"(?i)<br\s*/?>|</p>|</li>|</h[1-6]>|</div>|</ul>|</ol>", "\n", s)
    s = html.unescape(re.sub(r"<[^>]+>", "", s))
    return clean_lines(s.splitlines())


def md_to_lines(src: str) -> list[str]:
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", src)               # images
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)             # links -> text
    s = re.sub(r"^#{1,6}\s*", "", s, flags=re.M)                # headings
    s = re.sub(r"[*_`]{1,3}", "", s)                            # bold/italic/code marks
    s = re.sub(r"(?s)<[^>]+>", "", s)
    return clean_lines(html.unescape(s).splitlines())


# ---------- sources ----------
def curseforge_slug(url: str) -> str | None:
    m = re.match(r"https?://(?:www\.)?curseforge\.com/minecraft/[\w-]+/([\w-]+)", url)
    return m.group(1) if m else None


def modrinth_slug(url: str) -> str | None:
    m = re.match(r"https?://(?:www\.)?modrinth\.com/[\w-]+/([\w-]+)", url)
    return m.group(1) if m else None


def from_curseforge(slug: str, key: str, limit: int) -> list[dict]:
    h = {"x-api-key": key}
    found = get_json(f"{CF_API}/mods/search?gameId={MINECRAFT_GAME_ID}&slug={urllib.parse.quote(slug)}", h)["data"]
    mod = next((m for m in found if m.get("slug") == slug), None)
    if not mod:
        raise RuntimeError(f"CurseForge has no project with the slug '{slug}'")
    files = get_json(f"{CF_API}/mods/{mod['id']}/files?pageSize=50", h)["data"]
    files.sort(key=lambda f: f.get("fileDate", ""), reverse=True)
    entries = []
    for f in files[:limit]:
        time.sleep(0.2)
        try:
            raw = get_json(f"{CF_API}/mods/{mod['id']}/files/{f['id']}/changelog", h)["data"]
        except urllib.error.HTTPError:
            continue
        changes = html_to_lines(raw)
        if changes:
            entries.append({"version": (f.get("displayName") or f.get("fileName") or str(f["id"])).strip(),
                            "date": (f.get("fileDate") or "")[:10], "changes": changes})
    return entries


def from_modrinth(slug: str, limit: int) -> list[dict]:
    versions = get_json(f"{MR_API}/project/{urllib.parse.quote(slug)}/version")
    versions.sort(key=lambda v: v.get("date_published", ""), reverse=True)
    entries = []
    for v in versions[:limit]:
        changes = md_to_lines(v.get("changelog") or "")
        if changes:
            entries.append({"version": (v.get("name") or v.get("version_number") or "").strip(),
                            "date": (v.get("date_published") or "")[:10], "changes": changes})
    return entries


# ---------- output ----------
def write(path: Path, data: dict) -> None:
    body = json.dumps(data, indent=2, ensure_ascii=False)
    path.write_text(
        "// Generated by tools/fetch-changelogs.py from CurseForge and Modrinth. You can edit it, but a fresh run\n"
        "// replaces the projects it fetched. A `changelog` in data/projects.js always wins over this file.\n"
        "const CHANGELOGS = " + body + ";\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Fetch changelogs into data/changelogs.js")
    ap.add_argument("--only", action="append", help="project id (repeatable)")
    ap.add_argument("--limit", type=int, default=10, help="newest files per project (default 10)")
    ap.add_argument("--curseforge-key", default=os.environ.get("CURSEFORGE_API_KEY", ""))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    site = load_site()
    out_path = ROOT / "data" / "changelogs.js"
    try:
        current = js_const(out_path.read_text(encoding="utf-8"), "CHANGELOGS") if out_path.is_file() else {}
    except SystemExit:
        current = {}

    for p in site["projects"]:
        if args.only and p["id"] not in args.only:
            continue
        if p.get("changelog"):
            print(f'- {p["id"]}: has its own changelog in projects.js, skipped')
            continue
        cf = next((curseforge_slug(l["url"]) for l in p.get("links", []) if curseforge_slug(l["url"])), None)
        mr = next((modrinth_slug(l["url"]) for l in p.get("links", []) if modrinth_slug(l["url"])), None)
        entries, source, errors = [], "", []
        # Each source is tried on its own, so a failing CurseForge lookup still falls back to Modrinth
        if cf and args.curseforge_key:
            try:
                entries, source = from_curseforge(cf, args.curseforge_key, args.limit), "CurseForge"
            except (urllib.error.URLError, RuntimeError, KeyError, TimeoutError) as exc:
                errors.append(f"CurseForge: {exc}")
        if not entries and mr:
            try:
                entries, source = from_modrinth(mr, args.limit), "Modrinth"
            except (urllib.error.URLError, RuntimeError, KeyError, TimeoutError) as exc:
                errors.append(f"Modrinth: {exc}")
        if not entries:
            if errors:
                print(f'- {p["id"]}: could not fetch ({"; ".join(errors)}); kept what was there')
            else:
                why = "no CurseForge key given" if cf and not args.curseforge_key and not mr else "no changelog text found"
                print(f'- {p["id"]}: nothing fetched ({why}); kept what was there')
            continue
        current[p["id"]] = entries
        print(f'- {p["id"]}: {len(entries)} entries from {source}')

    if args.dry_run:
        print(json.dumps(current, indent=2, ensure_ascii=False)[:3000])
        return 0
    write(out_path, current)
    print(f"\nWrote {out_path.relative_to(ROOT)}. Now run: python tools/update-site.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
