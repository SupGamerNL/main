"""Shared helpers for the tools: reads the JavaScript data files (data/*.js).

Only Python's standard library is used. The website itself stays plain static
HTML, CSS and JavaScript and never needs Python.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def strip_comments(src: str) -> str:
    """Remove // and /* */ comments without touching text inside quotes."""
    out, i, q = [], 0, None
    while i < len(src):
        c = src[i]
        if q:
            out.append(c)
            if c == "\\" and i + 1 < len(src):
                i += 1
                out.append(src[i])
            elif c == q:
                q = None
            i += 1
        elif c in "\"'`":
            q = c
            out.append(c)
            i += 1
        elif src.startswith("//", i):
            j = src.find("\n", i)
            i = len(src) if j < 0 else j
        elif src.startswith("/*", i):
            j = src.find("*/", i + 2)
            i = len(src) if j < 0 else j + 2
        else:
            out.append(c)
            i += 1
    return "".join(out)


def _js_to_json(text: str) -> str:
    """Turn a JS object/array literal (bare keys, 'single' quotes, trailing commas) into JSON."""
    out: list[str] = []
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        if c in "\"'":
            j, buf = i + 1, []
            while j < n and text[j] != c:
                if text[j] == "\\" and j + 1 < n:
                    nxt = text[j + 1]
                    buf.append("'" if nxt == "'" else "\\" + nxt)
                    j += 2
                else:
                    buf.append('\\"' if text[j] == '"' else text[j])
                    j += 1
            out.append('"' + "".join(buf) + '"')
            i = j + 1
        elif c == "`":
            raise SystemExit("Template strings (backticks) are not supported in the data files. Use normal quotes.")
        elif c.isalpha() or c in "_$":
            m = re.compile(r"[A-Za-z_$][\w$]*").match(text, i)
            word = m.group(0)
            rest = text[m.end():].lstrip()
            if rest.startswith(":"):
                out.append(json.dumps(word))
            elif word in ("true", "false", "null"):
                out.append(word)
            else:
                raise SystemExit(f"Unexpected word '{word}' in a data file (only plain values are allowed).")
            i = m.end()
        elif c in "]}":
            while out and out[-1].strip() == "":
                out.pop()
            if out and out[-1] == ",":
                out.pop()
            out.append(c)
            i += 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def js_const(source: str, name: str):
    """Return the value of `const NAME = <literal>;` from JS source."""
    src = strip_comments(source)
    m = re.search(r"\bconst\s+" + re.escape(name) + r"\s*=\s*", src)
    if not m:
        raise SystemExit(f"Could not find `const {name} = ...` in the data file")
    start = m.end()
    if src[start] in "[{":
        depth, q, k = 0, None, start
        while k < len(src):
            ch = src[k]
            if q:
                if ch == "\\":
                    k += 1
                elif ch == q:
                    q = None
            elif ch in "\"'":
                q = ch
            elif ch in "[{":
                depth += 1
            elif ch in "]}":
                depth -= 1
                if depth == 0:
                    break
            k += 1
        literal = src[start:k + 1]
    else:
        literal = src[start:src.index(";", start)]
    try:
        return json.loads(_js_to_json(literal))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not read `{name}`: {exc}")


def load_site() -> dict:
    """Everything the tools need from data/*.js."""
    data = ROOT / "data"
    proj = (data / "projects.js").read_text(encoding="utf-8")
    cfg = (data / "config.js").read_text(encoding="utf-8")
    prof = (data / "profiles.js").read_text(encoding="utf-8")
    gal = (data / "gallery.js").read_text(encoding="utf-8")
    live = re.search(r"\bconst\s+RELEASES_LIVE\s*=\s*(true|false)", strip_comments(proj))
    return {
        "projects": js_const(proj, "PROJECTS"),
        "releases_repo": js_const(proj, "RELEASES_REPO") if "RELEASES_REPO" in proj else "",
        "releases_live": bool(live and live.group(1) == "true"),
        "site": js_const(cfg, "SITE_CONFIG"),
        "profiles": js_const(prof, "PROFILES"),
        "gallery_extra": js_const(gal, "GALLERY_EXTRA"),
    }
