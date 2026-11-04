// Statistics, file sizes and release download counts. Everything here is optional:
// if a lookup fails the page simply shows less, nothing breaks.
//  - Release download counts + sizes: GitHub API (cached for 15 min in this browser tab session, to stay inside GitHub's rate limit)
//  - File sizes of files on this site: a HEAD request, with data/sizes.js as the fallback
//  - Page views + downloads of files on this site: GoatCounter (only when STATS_CONFIG.goatcounter is filled in)
const Stats = (() => {
  const code = (typeof STATS_CONFIG !== "undefined" && STATS_CONFIG.goatcounter || "").trim();
  const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  const manifest = typeof FILE_SIZES !== "undefined" ? FILE_SIZES : {};
  const repo = typeof RELEASES_REPO !== "undefined" ? RELEASES_REPO : "";
  const store = (k, v) => { try { v === undefined ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v })); } catch (e) {} };
  const recall = (k, maxAge) => { try { const o = JSON.parse(sessionStorage.getItem(k)); return o && Date.now() - o.t < maxAge ? o : null; } catch (e) { return null; } };

  // ---- GoatCounter ----
  let gc = null;
  function counter() {
    if (!code || dnt) return Promise.resolve(null);
    if (!gc) gc = new Promise(res => {
      const s = document.createElement("script");
      s.async = true; s.src = "https://gc.zgo.at/count.js";
      s.dataset.goatcounter = "https://" + code + ".goatcounter.com/count";
      s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
      s.onload = () => res(window.goatcounter || null);
      s.onerror = () => res(null);
      document.head.append(s);
    });
    return gc;
  }
  // Paths are flat on purpose ("/p-veldoria"): the page address itself has a query string, which GoatCounter would drop
  function hit(path, title, event) { counter().then(g => g && g.count && g.count({ path, title, event: !!event })); }
  const view = (path, title) => hit(path, title, false);
  const download = (path, title) => hit(path, title, true);

  async function count(path) {
    if (!code) return null;
    const key = "gc:" + path, c = recall(key, 5 * 60 * 1000);
    if (c) return c.v;
    const base = "https://" + code + ".goatcounter.com/counter/";
    for (const url of [base + encodeURIComponent(path) + ".json", base + path + ".json"]) {
      try {
        const r = await fetch(url);
        if (r.status === 404) { store(key, 0); return 0; }
        if (!r.ok) continue;
        const n = parseInt(String((await r.json()).count).replace(/\D/g, ""), 10);
        if (!isNaN(n)) { store(key, n); return n; }
      } catch (e) { /* try the next form */ }
    }
    return null;
  }

  // ---- GitHub Releases ----
  const releases = {};
  function release(tag) {
    if (!repo) return Promise.resolve(null);
    return releases[tag] || (releases[tag] = (async () => {
      const key = "gh:" + tag, c = recall(key, 15 * 60 * 1000);
      if (c) return c.v;
      try {
        const r = await fetch("https://api.github.com/repos/" + repo + "/releases/tags/" + encodeURIComponent(tag), { headers: { Accept: "application/vnd.github+json" } });
        if (!r.ok) return null;
        const assets = {};
        (await r.json()).assets.forEach(a => { assets[a.name] = { size: a.size, downloads: a.download_count }; });
        store(key, assets);
        return assets;
      } catch (e) { return null; }
    })());
  }

  // ---- File sizes ----
  const sizeKey = d => d.file || (d.release ? "release:" + d.release.tag + "/" + d.release.asset : "");
  function knownSize(d) { const n = manifest[sizeKey(d)]; return n ? Site.fmtBytes(n) : (d.size || ""); }
  async function liveSize(path) {
    try {
      const r = await fetch(Site.fileUrl(path), { method: "HEAD", cache: "no-cache" });
      const n = parseInt(r.headers.get("content-length"), 10);
      return r.ok && n > 0 ? n : null;
    } catch (e) { return null; }
  }

  return { enabled: !!code, view, download, count, release, knownSize, liveSize };
})();
