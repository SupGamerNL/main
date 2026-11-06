// Shared helpers for every page. Needs data/config.js (SITE_CONFIG) and data/projects.js (PROJECTS) loaded first.
const Site = (() => {
  const cfg = SITE_CONFIG;
  const IMG = "assets/img/";

  function el(tag, props = {}, ...kids) {
    const n = Object.assign(document.createElement(tag), props);
    kids.forEach(k => n.append(k));
    return n;
  }

  // Encode a path piece for a URL. encodeURIComponent leaves ' ( ) alone, so those are done too
  // (file names like "MOAT(Mo' Ores ...).jar" then work everywhere).
  const enc = s => encodeURIComponent(s).replace(/['()]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  const fileUrl = path => path.split("/").map(enc).join("/");
  const abs = path => new URL(path, cfg.url).href;
  const projectUrl = id => "project.html?id=" + encodeURIComponent(id);
  // The link to post in Discord/Reddit/etc: a small page with the project's own title, text and image (made by tools/update-site.py)
  const shareUrl = id => abs("share/" + encodeURIComponent(id) + "/");
  // "Report a bug" link: the project's own `issues` address, else the site-wide one. GitHub addresses open a new issue with the title started.
  function issueUrl(p) {
    const base = p.issues || cfg.issues;
    if (!base) return "";
    return /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/?$/.test(base)
      ? base.replace(/\/$/, "") + "/new?title=" + encodeURIComponent(p.name + ": ")
      : base;
  }

  // Sizes: 1 KB = 1024 bytes, like before ("375 KB", "1.5 MB", "263 MB")
  function fmtBytes(n) {
    if (!(n >= 0)) return "";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return Math.round(n / 1024) + " KB";
    if (n < 1024 ** 3) { const mb = n / 1024 ** 2; return (mb >= 100 ? Math.round(mb) : mb.toFixed(1)) + " MB"; }
    return (n / 1024 ** 3).toFixed(1) + " GB";
  }

  // ---- Status ----
  const STATUS = {
    "released": "Released",
    "in-development": "In development",
    "planned": "Planned",
    "on-hold": "On hold",
    "archived": "Archived"
  };
  function statusBadge(p) {
    if (!p.status) return null;
    const b = el("span", { className: "status", textContent: STATUS[p.status] || p.status });
    b.dataset.s = p.status;
    return b;
  }

  // ---- Versions / compatibility ----
  const rowTarget = r => r.game || r.engine || "";
  function versionText(v) { return !v || !v.length ? "" : v.length > 2 ? v[0] + " \u2013 " + v[v.length - 1] : v.join(", "); }
  function supportLine(r) {
    return [[rowTarget(r), versionText(r.versions)].filter(Boolean).join(" "), r.loader].filter(Boolean).join(" \u00B7 ");
  }

  // ---- Cover image: explicit "cover", else the first screenshot ----
  function cover(p) {
    const f = p.cover || (p.gallery && p.gallery[0] && p.gallery[0].file);
    return f ? { src: IMG + p.id + "/" + f, thumb: IMG + p.id + "/thumbs/" + f } : null;
  }

  // ---- Search ----
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['\u2019`]/g, "");
  // Search text: every word is kept (dots stay, so "1.12.2" is one word); a search word must match the START of a word
  const words = s => " " + norm(s).replace(/[^a-z0-9.+]+/g, " ").trim();
  function searchText(p) {
    const page = p.page || {};
    const parts = [p.name, p.category, p.description, STATUS[p.status] || p.status, (p.tags || []).join(" "), page.intro,
      (p.downloads || []).map(d => [d.label, d.note, d.group].join(" ")).join(" "),
      (p.support || []).map(r => [r.label, rowTarget(r), (r.versions || []).join(" "), r.loader, (r.requires || []).join(" "), r.note].join(" ")).join(" "),
      (page.versions || []).map(v => [v.name, v.range].join(" ")).join(" "),
      (page.sections || []).map(s => [s.title, s.text, (s.chips || []).join(" "), (s.list || []).join(" ")].join(" ")).join(" "), p.credits];
    return words(parts.filter(Boolean).join(" ")) + " ";
  }

  // ---- <head> helpers (project pages set their own SEO tags here) ----
  function metaTag(selector, attr, value) {
    let n = document.head.querySelector(selector);
    if (!n) {
      n = el(selector.startsWith("link") ? "link" : "meta");
      const m = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/);
      if (m) n.setAttribute(m[1], m[2]);
      document.head.append(n);
    }
    n.setAttribute(attr, value);
  }
  function setHead(o) {
    document.title = o.title;
    metaTag('meta[name="description"]', "content", o.description);
    metaTag('link[rel="canonical"]', "href", o.url);
    metaTag('meta[name="robots"]', "content", o.robots || "index, follow, max-image-preview:large");
    metaTag('meta[property="og:type"]', "content", o.type || "website");
    metaTag('meta[property="og:title"]', "content", o.title);
    metaTag('meta[property="og:description"]', "content", o.description);
    metaTag('meta[property="og:url"]', "content", o.url);
    metaTag('meta[property="og:image"]', "content", o.image || abs(cfg.image));
    metaTag('meta[property="og:image:alt"]', "content", o.imageAlt || cfg.imageAlt);
    metaTag('meta[name="twitter:card"]', "content", o.image ? "summary_large_image" : "summary");
    metaTag('meta[name="twitter:title"]', "content", o.title);
    metaTag('meta[name="twitter:description"]', "content", o.description);
    metaTag('meta[name="twitter:image"]', "content", o.image || abs(cfg.image));
    if (o.jsonld) {
      const old = document.getElementById("ld-page");
      if (old) old.remove();
      const s = el("script", { type: "application/ld+json", id: "ld-page" });
      s.textContent = JSON.stringify(o.jsonld);
      document.head.append(s);
    }
  }

  return { cfg, IMG, el, enc, fileUrl, abs, projectUrl, shareUrl, issueUrl, fmtBytes, STATUS, statusBadge, rowTarget, versionText, supportLine, cover, norm, words, searchText, setHead };
})();

// Pause the background pulse when the tab isn't visible
document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("paused", document.hidden);
});
