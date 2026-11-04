// File sizes for the Downloads section.
// data/sizes.js (made by tools/update-site.py) has the sizes of every download. For files on this site the
// browser also asks for the current size, so a replaced file shows its new size right away.
const FileSize = (() => {
  const manifest = typeof FILE_SIZES !== "undefined" ? FILE_SIZES : {};
  const key = d => d.file || (d.release ? "release:" + d.release.tag + "/" + d.release.asset : "");
  const known = d => { const n = manifest[key(d)]; return n ? Site.fmtBytes(n) : (d.size || ""); };
  async function live(path) {
    try {
      const r = await fetch(Site.fileUrl(path), { method: "HEAD", cache: "no-cache" });
      const n = parseInt(r.headers.get("content-length"), 10);
      return r.ok && n > 0 ? n : null;
    } catch (e) { return null; }
  }
  return { known, live };
})();
