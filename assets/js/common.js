// Shared helpers for every page. Needs data/config.js (SITE_CONFIG) and data/projects.js (PROJECTS) loaded first.
const Site = (() => {
  const cfg = SITE_CONFIG;
  // Pages inside projects/<id>/ set data-root="../../" on <html>, so every link and file path below still points at the site root.
  const ROOT = document.documentElement.dataset.root || "";
  const here = path => ROOT + path;                                     // a site-root path ("assets/img/x.webp") -> usable from this page
  const siteRel = path => (ROOT && path.startsWith(ROOT) ? path.slice(ROOT.length) : path);
  const IMG = here("assets/img/");

  function el(tag, props = {}, ...kids) {
    const n = Object.assign(document.createElement(tag), props);
    kids.forEach(k => n.append(k));
    return n;
  }

  // Encode a path piece for a URL. encodeURIComponent leaves ' ( ) alone, so those are done too
  // (file names like "MOAT(Mo' Ores ...).jar" then work everywhere).
  const enc = s => encodeURIComponent(s).replace(/['()]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  const fileUrl = path => here(path.split("/").map(enc).join("/"));
  const abs = path => new URL(siteRel(path), cfg.url).href;                   // the full public address (accepts paths made with here())
  const projectUrl = id => here("projects/" + encodeURIComponent(id) + "/");   // each project has its own page (made by tools/update-site.py)
  // The link to post in Discord/Reddit/etc: the project page itself (it carries its own title, text and image for link previews)
  const shareUrl = id => abs(projectUrl(id));
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

  // ---- Dates (used for sorting). Optional "released" / "updated" in projects.js (YYYY, YYYY-MM or YYYY-MM-DD);
  //      otherwise the oldest / newest date found in the changelog and timeline is used. ----
  const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
  const dateKey = d => (DATE.test(d || "") ? d + "-01-01".slice(d.length - 4) : "");   // sortable YYYY-MM-DD, "" if missing or invalid
  function dates(p) {
    const log = p.changelog || (typeof CHANGELOGS !== "undefined" && CHANGELOGS[p.id]) || [];
    const list = [...log.map(c => c.date), ...(p.timeline || []).map(t => t.date)].filter(dateKey).sort((a, b) => (dateKey(a) < dateKey(b) ? -1 : 1));
    const released = dateKey(p.released) ? p.released : list[0] || "";
    const updated = dateKey(p.updated) ? p.updated : list[list.length - 1] || released;
    return { released, updated };
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
  function setMeta(key, value, content) { // key: "name" or "property"
    let n = document.head.querySelector(`meta[${key}="${value}"]`);
    if (!n) { n = el("meta"); n.setAttribute(key, value); document.head.append(n); }
    n.setAttribute("content", content);
  }
  function setHead(o) {
    const image = o.image || abs(cfg.image);
    document.title = o.title;
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = el("link", { rel: "canonical" }); document.head.append(link); }
    link.href = o.url;
    [["name", "description", o.description],
     ["name", "robots", o.robots || "index, follow, max-image-preview:large"],
     ["property", "og:type", o.type || "website"],
     ["property", "og:title", o.title],
     ["property", "og:description", o.description],
     ["property", "og:url", o.url],
     ["property", "og:image", image],
     ["property", "og:image:alt", o.imageAlt || cfg.imageAlt],
     ["name", "twitter:card", o.image ? "summary_large_image" : "summary"],
     ["name", "twitter:title", o.title],
     ["name", "twitter:description", o.description],
     ["name", "twitter:image", image]].forEach(m => setMeta(...m));
    if (o.jsonld) {
      document.getElementById("ld-page")?.remove();
      document.head.append(el("script", { type: "application/ld+json", id: "ld-page", textContent: JSON.stringify(o.jsonld) }));
    }
  }

  // ---- Breadcrumbs: Home > ... > current page (the last item is the current page and not a link) ----
  const CREATIONS = here("index.html#grid");                                                      // the project list on the home page
  const categoryUrl = c => here("index.html?cat=" + encodeURIComponent(c) + "#grid");             // the list filtered to one category
  function breadcrumbs(items) {   // items: [{ label, href? }]
    const nav = el("nav", { className: "crumbs" });
    nav.setAttribute("aria-label", "Breadcrumb");
    nav.append(el("ol", {}, ...items.map((it, i) => {
      if (i < items.length - 1) return el("li", {}, el("a", { href: it.href, textContent: it.label }));
      const here = el("span", { textContent: it.label });
      here.setAttribute("aria-current", "page");
      return el("li", {}, here);
    })));
    return nav;
  }

  // ---- "Find me online" pills (from data/profiles.js); the featured one goes first ----
  function renderProfiles(list) {
    if (!list || typeof PROFILES === "undefined") return;
    const sorted = [...PROFILES].sort((a, b) => !!b.featured - !!a.featured);
    list.append(...sorted.map(p => el("li", {}, el("a", { href: p.url, textContent: p.label, className: p.featured ? "featured" : "" }))));
  }

  return { cfg, IMG, here, el, enc, fileUrl, abs, projectUrl, shareUrl, issueUrl, fmtBytes, STATUS, statusBadge, dates, dateKey, rowTarget, supportLine, cover, words, searchText, setHead, renderProfiles, breadcrumbs, CREATIONS, categoryUrl };
})();
