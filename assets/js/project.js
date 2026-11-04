// Needs data/projects.js + common.js + gallery.js + stats.js loaded first.
// Opened as project.html?id=<project id>
const { el, enc, fileUrl, fmtBytes, fmtNum } = Site;
const root = document.getElementById("project");
const id = new URLSearchParams(location.search).get("id");
const p = PROJECTS.find(x => x.id === id);

const releasesOn = typeof RELEASES_LIVE !== "undefined" && RELEASES_LIVE && typeof RELEASES_REPO !== "undefined";
const releasesBase = releasesOn ? "https://github.com/" + RELEASES_REPO + "/releases" : "";
const releaseCounts = typeof STATS_CONFIG === "undefined" || STATS_CONFIG.releaseCounts !== false;
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- Downloads ----------
// Each row shows: note · size · number of downloads. The size comes from data/sizes.js at once and is
// then checked live; the number of downloads is added when it is known.
function downloadRow(d) {
  const state = { size: Stats.knownSize(d), site: null, release: null };
  const sub = el("span", { className: "dl-sub" });
  const paint = () => {
    const known = [state.site, state.release].filter(n => n !== null);
    const total = known.reduce((a, b) => a + b, 0);
    sub.textContent = [d.note, state.size, known.length ? fmtNum(total) + (total === 1 ? " download" : " downloads") : ""].filter(Boolean).join(" \u00B7 ");
    sub.hidden = !sub.textContent;
    if (known.length === 2) sub.title = fmtNum(state.site) + " from this site, " + fmtNum(state.release) + " from GitHub Releases";
  };
  const info = el("div", { className: "dl-info" }, el("strong", { textContent: d.label }), sub);

  const acts = el("div", { className: "dl-acts" });
  const statPath = d.file ? "/dl-" + p.id + "-" + slug(d.file.split("/").pop()) : "";
  if (d.file) {
    // "download" makes the browser save the file instead of opening it (works because it's on the same site)
    const a = el("a", { className: "btn", href: fileUrl(d.file), download: "", textContent: "Download" });
    a.addEventListener("click", () => Stats.download(statPath, "Download: " + p.name + " " + d.label));
    acts.append(a);
  }
  if (releasesOn && d.release) {
    // A direct link to the release asset: it starts downloading right away (GitHub counts these itself)
    acts.append(el("a", { className: d.file ? "btn alt" : "btn", href: releasesBase + "/download/" + enc(d.release.tag) + "/" + enc(d.release.asset), rel: "noopener", textContent: "GitHub Release" }));
    acts.append(el("a", { className: "dl-page", href: releasesBase + "/tag/" + enc(d.release.tag), rel: "noopener", textContent: "Release page" }));
  }
  const row = el("li", { className: "dl" }, info, acts);
  row.querySelectorAll(".btn").forEach(b => b.setAttribute("aria-label", b.textContent + ": " + d.label));
  paint();

  // Live lookups (all optional; each one only adds information)
  const jobs = [];
  if (d.file) {
    jobs.push(Stats.liveSize(d.file).then(n => { if (n) { state.size = fmtBytes(n); paint(); } }));
    jobs.push(Stats.count(statPath).then(n => { if (n !== null) { state.site = n; paint(); } }));
  }
  if (releasesOn && d.release) {
    jobs.push(Stats.release(d.release.tag).then(assets => {
      const a = assets && assets[d.release.asset];
      if (!a) return;
      if (!d.file) state.size = fmtBytes(a.size);
      if (releaseCounts) state.release = a.downloads;
      paint();
    }));
  }
  return { row, done: Promise.all(jobs).then(() => (state.site || 0) + (state.release || 0) || (state.site === null && state.release === null ? null : 0)) };
}

function downloadsSection(list, onTotals) {
  const sec = el("section", { className: "sec" }, el("h2", { textContent: "Downloads" }));
  const groups = [];
  list.forEach(d => {
    const name = d.group || "";
    let g = groups.find(x => x.name === name);
    if (!g) groups.push(g = { name, items: [] });
    g.items.push(d);
  });
  const jobs = [];
  groups.forEach(g => {
    if (g.name) sec.append(el("h3", { className: "dl-group", textContent: g.name }));
    const rows = g.items.map(downloadRow);
    rows.forEach(r => jobs.push(r.done));
    sec.append(el("ul", { className: "dls" }, ...rows.map(r => r.row)));
  });
  Promise.all(jobs).then(onTotals);
  return sec;
}

// ---------- Statistics strip ----------
function statsStrip() {
  const strip = el("div", { className: "stats", hidden: true });
  const add = (value, label) => {
    let item = strip.querySelector('[data-k="' + label + '"]');
    if (!item) { item = el("div", { className: "stat" }, el("strong"), el("span", { textContent: label })); item.dataset.k = label; strip.append(item); }
    item.querySelector("strong").textContent = fmtNum(value);
    strip.hidden = false;
  };
  return { strip, add };
}

// ---------- Compatibility (versions of game / engine / mod loader) ----------
function compatSection(rows) {
  const fact = (term, ...vals) => [el("dt", { textContent: term }), el("dd", {}, ...vals)];
  const chips = list => el("span", { className: "chips" }, ...list.map(v => el("span", { className: "tag", textContent: v })));
  const cards = rows.map(r => {
    const dl = el("dl", { className: "facts" });
    dl.append(...fact(r.engine && !r.game ? "Engine" : "Game", Site.rowTarget(r)));
    if (r.versions && r.versions.length) dl.append(...fact(r.versions.length > 1 ? "Versions" : "Version", chips(r.versions)));
    if (r.loader) dl.append(...fact("Mod loader", r.loader));
    if (r.requires && r.requires.length) dl.append(...fact("Requires", chips(r.requires)));
    if (r.note) dl.append(...fact("Note", r.note));
    return el("div", { className: "version" }, ...(r.label ? [el("h3", { textContent: r.label })] : []), dl);
  });
  return el("section", { className: "sec" }, el("h2", { textContent: "Compatibility" }), el("div", { className: "versions" }, ...cards));
}

// ---------- Changelog + timeline ----------
function changelogSection(list) {
  const items = list.map((c, i) => {
    const d = el("details", { className: "log", open: i === 0 },
      el("summary", {}, el("strong", { textContent: c.version }), ...(c.date ? [el("span", { className: "log-date", textContent: c.date })] : [])),
      el("ul", {}, ...c.changes.map(t => el("li", { textContent: t }))));
    return d;
  });
  return el("section", { className: "sec" }, el("h2", { textContent: "Changelog" }), ...items);
}

function timelineSection(list) {
  return el("section", { className: "sec" }, el("h2", { textContent: "Timeline" }),
    el("ol", { className: "timeline" }, ...list.map(t => el("li", {},
      el("span", { className: "tl-date", textContent: t.date }),
      el("strong", { textContent: t.title }),
      ...(t.text ? [el("p", { textContent: t.text })] : [])))));
}

// ---------- SEO: title, description, canonical, share tags, structured data ----------
function seo() {
  const url = Site.abs(Site.projectUrl(p.id));
  const c = Site.cover(p);
  const image = c ? Site.abs(c.src) : "";
  const keywords = [...(p.tags || []), p.category, ...(p.support || []).flatMap(r => [Site.rowTarget(r), r.loader, ...(r.versions || [])])].filter(Boolean);
  const person = { "@type": "Person", name: Site.cfg.author, url: Site.cfg.url };
  Site.setHead({
    title: p.name + " | SupGamer NL",
    description: p.description,
    url, image, type: "article",
    imageAlt: c ? p.name + " screenshot" : "",
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        Object.assign({
          "@type": "CreativeWork", "@id": url + "#work", name: p.name, description: p.description, url,
          genre: p.category, keywords: [...new Set(keywords)].join(", "), inLanguage: "en", creator: person, copyrightHolder: person,
          isPartOf: { "@type": "WebSite", name: Site.cfg.name, url: Site.cfg.url }
        }, image ? { image } : {}, (p.links || []).length ? { sameAs: p.links.map(l => l.url) } : {}),
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Creations", item: Site.cfg.url },
          { "@type": "ListItem", position: 2, name: p.name, item: url }
        ] }
      ]
    }
  });
}

function notFound() {
  Site.setHead({ title: "Project not found | SupGamer NL", description: "There's no project with that id.", url: Site.abs("index.html"), robots: "noindex" });
  root.replaceChildren(
    el("a", { className: "back", href: "index.html", textContent: "Back to all creations" }),
    el("h1", { textContent: "Project not found" }),
    el("p", { className: "lead", textContent: "There's no project with that id. Pick one from the index instead." })
  );
}

function render() {
  const page = p.page || {};
  seo();
  const parts = [];

  parts.push(el("a", { className: "back", href: "index.html", textContent: "Back to all creations" }));
  const badge = Site.statusBadge(p);
  parts.push(el("h1", { textContent: p.name }));
  parts.push(el("div", { className: "meta" },
    ...(badge ? [badge] : []),
    el("span", { className: "tag", textContent: p.category }),
    ...(p.tags || []).map(t => el("span", { className: "tag", textContent: t }))
  ));

  const c = Site.cover(p);
  if (c) parts.push(el("figure", { className: "cover" }, el("img", { src: c.src, alt: p.name + " cover image", decoding: "async", fetchPriority: "high" })));

  parts.push(el("p", { className: "lead", textContent: page.intro || p.description }));

  if (p.links && p.links.length) {
    parts.push(el("div", { className: "btns" },
      ...p.links.map(l => el("a", { className: "btn", href: l.url, textContent: l.label }))
    ));
  }

  const st = statsStrip();
  parts.push(st.strip);

  if (p.support && p.support.length) parts.push(compatSection(p.support));
  if (p.downloads && p.downloads.length) {
    parts.push(downloadsSection(p.downloads, totals => {
      const known = totals.filter(n => n !== null);
      if (known.length) st.add(known.reduce((a, b) => a + b, 0), "Downloads");
    }));
  }
  if (p.changelog && p.changelog.length) parts.push(changelogSection(p.changelog));

  if (p.gallery && p.gallery.length) {
    const grid = el("ul", { className: "shots" });
    Gallery.thumbs(grid, Gallery.collect().filter(x => x.id === p.id));
    parts.push(el("section", { className: "sec" }, el("h2", { textContent: "Screenshots" }), grid));
  }

  if (page.versions && page.versions.length) {
    parts.push(el("section", { className: "sec" },
      el("h2", { textContent: "Versions" }),
      el("div", { className: "versions" },
        ...page.versions.map(v => el("div", { className: "version" },
          el("h3", { textContent: v.name }),
          el("p", { className: "range", textContent: v.range }),
          el("p", { textContent: v.note }),
          ...(v.links && v.links.length
            ? [el("div", { className: "links" }, ...v.links.map(l => el("a", { href: l.url, textContent: l.label })))]
            : [])
        ))
      )
    ));
  }

  (page.sections || []).forEach(s => {
    const sec = el("section", { className: "sec" }, el("h2", { textContent: s.title }));
    if (s.text) sec.append(el("p", { textContent: s.text }));
    if (s.chips && s.chips.length) {
      sec.append(el("div", { className: "meta" }, ...s.chips.map(c => el("span", { className: "tag", textContent: c }))));
    }
    parts.push(sec);
  });

  if (p.timeline && p.timeline.length) parts.push(timelineSection(p.timeline));

  // Stagger the entrance of each block (one-time, CSS does the animating)
  parts.forEach((n, i) => n.style.setProperty("--i", i));
  root.replaceChildren(...parts);

  // Page views (GoatCounter, when switched on)
  Stats.view("/p-" + p.id, p.name);
  Stats.count("/p-" + p.id).then(n => { if (n !== null) st.add(n, "Page views"); });
}

p ? render() : notFound();
