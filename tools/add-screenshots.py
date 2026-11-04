#!/usr/bin/env python3
"""Turn your original screenshots into the full + thumbnail WebP pair and print the gallery lines.

Usage
  python tools/add-screenshots.py <project-id> <screenshot or folder> [more ...]
  python tools/add-screenshots.py general <screenshot or folder>     (screenshots not tied to a project)

Examples
  python tools/add-screenshots.py blood-n-meat "C:/Pictures/Minecraft/new-shots"
  python tools/add-screenshots.py veldoria title.png battle.png

Needs Pillow once:   pip install pillow
What you get
  assets/img/<id>/name.webp          full size (max 1920px wide, quality 85)
  assets/img/<id>/thumbs/name.webp   thumbnail (640px wide, quality 80)
Then paste the printed lines into that project's `gallery` list in data/projects.js
and write what each screenshot shows in place of the TODO text.
"""
from __future__ import annotations
import argparse
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _sitedata import ROOT, load_site  # noqa: E402

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("This tool needs Pillow. Install it with:  pip install pillow")

EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tif", ".tiff"}


def slug(name: str) -> str:
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()  # Café -> Cafe
    s = re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")
    return s or "screenshot"


def gather(paths: list[str]) -> list[Path]:
    found: list[Path] = []
    for raw in paths:
        p = Path(raw).expanduser()
        if p.is_dir():
            found += sorted(f for f in p.iterdir() if f.suffix.lower() in EXTS)
        elif p.is_file() and p.suffix.lower() in EXTS:
            found.append(p)
        else:
            print(f"  skipped (not an image or folder): {raw}")
    return found


def save_webp(img: Image.Image, dest: Path, width: int, quality: int) -> None:
    out = img
    if img.width > width:
        out = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    if out.mode not in ("RGB", "RGBA"):
        out = out.convert("RGBA" if "A" in out.getbands() else "RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "WEBP", quality=quality, method=6)  # metadata (EXIF, GPS) is not copied


def main() -> int:
    ap = argparse.ArgumentParser(description="Make full + thumbnail WebP files and print gallery lines.")
    ap.add_argument("project", help='project id from data/projects.js, or "general"')
    ap.add_argument("sources", nargs="+", help="screenshot files and/or folders")
    ap.add_argument("--overwrite", action="store_true", help="replace files that already exist")
    ap.add_argument("--max-width", type=int, default=1920)
    ap.add_argument("--quality", type=int, default=85)
    ap.add_argument("--thumb-width", type=int, default=640)
    ap.add_argument("--thumb-quality", type=int, default=80)
    args = ap.parse_args()

    site = load_site()
    ids = [p["id"] for p in site["projects"]]
    if args.project != "general" and args.project not in ids:
        print(f'No project with id "{args.project}". Known ids: {", ".join(ids)}, or "general".')
        return 1

    listed = set()
    if args.project == "general":
        listed = {g["file"] for g in site["gallery_extra"]}
    else:
        listed = {g["file"] for p in site["projects"] if p["id"] == args.project for g in p.get("gallery", [])}

    folder = ROOT / "assets" / "img" / args.project
    files = gather(args.sources)
    if not files:
        print("No images found.")
        return 1

    lines, made, taken = [], 0, set()
    for src in files:
        name = slug(src.stem)
        n = 2
        while name in taken:  # two source files with the same name in one run
            name = f"{slug(src.stem)}-{n}"
            n += 1
        taken.add(name)
        target = f"{name}.webp"
        if (folder / target).exists() and not args.overwrite:
            print(f"  exists, skipped: {target} (use --overwrite to replace it)")
            if target not in listed:
                lines.append(f'      {{ file: "{target}", caption: "TODO: describe what this screenshot shows." }},')
            continue
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            save_webp(im, folder / target, args.max_width, args.quality)
            save_webp(im, folder / "thumbs" / target, args.thumb_width, args.thumb_quality)
        made += 1
        full_kb = (folder / target).stat().st_size / 1024
        thumb_kb = (folder / "thumbs" / target).stat().st_size / 1024
        print(f"  {src.name} -> {target}  ({full_kb:.0f} KB full, {thumb_kb:.0f} KB thumbnail)")
        if target not in listed:
            lines.append(f'      {{ file: "{target}", caption: "TODO: describe what this screenshot shows." }},')

    print(f"\n{made} screenshot(s) converted into assets/img/{args.project}/ (and thumbs/).")
    if lines:
        where = "GALLERY_EXTRA in data/gallery.js" if args.project == "general" else f'the "gallery" list of "{args.project}" in data/projects.js'
        print(f"\nAdd these lines to {where}. If it has no gallery yet, wrap them in  gallery: [ ... ],\n")
        print("\n".join(l.replace("      ", "  ", 1) for l in lines))
    else:
        print("Nothing new to add to the data files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
