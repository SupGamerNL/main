// Needs data/projects.js + data/changelogs.js + common.js + gallery.js + filesize.js loaded first.
// Opened as project.html?id=<project id>
const { el, enc, fileUrl, fmtBytes } = Site;
const root = document.getElementById("project");
const id = new URLSearchParams(location.search).get("id");
const p = PROJECTS.find(x => x.id === id);

const releasesOn = typeof RELEASES_LIVE !== "undefined" && RELEASES_LIVE && typeof RELEASES_REPO !== "undefined";
const releasesBase = releasesOn ? "https://github.com/" + RELEASES_REPO + "/releases" : "";

// ---------- Downloads ----------
// Each row shows: note and file size. The size comes from data/sizes.js at once; for files on this site
// the browser then checks the current size.
function downloadRow(d) {
  let size = FileSize.known(d);
  const sub = el("span", { className: "dl-sub" });
  const paint = () => { sub.textContent = [d.note, size].filter(Boolean).join(" \u00B7 "); sub.hidden = !sub.textContent; };
  const info = el("div", { className: "dl-info" }, el("strong", { textContent: d.label }), sub);

  const acts = el("div", { className: "dl-acts" });
  if (d.file) {
    // "download" makes the browser save the file instead of opening it (works because it's on the same site)
    acts.append(el("a", { className: "btn", href: fileUrl(d.file), download: "", textContent: "Download" }));
  }
  if (releasesOn && d.release) {
    // A direct link to the release asset: it starts downloading right away
    acts.append(el("a", { className: d.file ? "btn alt" : "btn", href: releasesBase + "/download/" + enc(d.release.tag) + "/" + enc(d.release.asset), rel: "noopener", textContent: "GitHub Release" }));
    acts.append(el("a", { className: "dl-page", href: releasesBase + "/tag/" + enc(d.release.tag), rel: "noopener", textContent: "Release page" }));
  }
  const row = el("li", { className: "dl" }, info, acts);
  row.querySelectorAll(".btn").forEach(b => b.setAttribute("aria-label", b.textContent + ": " + d.label));
  paint();
  if (d.file) FileSize.live(d.file).then(n => { if (n) { size = fmtBytes(n); paint(); } });
  return row;
}

function downloadsSection(list) {
  const sec = el("section", { className: "sec" }, el("h2", { textContent: "Downloads" }));
  const groups = [];
  list.forEach(d => {
    const name = d.group || "";
    let g = groups.find(x => x.name === name);
    if (!g) groups.push(g = { name, items: [] });
    g.items.push(d);
  });
  groups.forEach(g => {
    if (g.name) sec.append(el("h3", { className: "dl-group", textContent: g.name }));
    sec.append(el("ul", { className: "dls" }, ...g.items.map(downloadRow)));
  });
  return sec;
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

  const btns = el("div", { className: "btns" }, ...(p.links || []).map(l => el("a", { className: "btn", href: l.url, textContent: l.label })));
  const bug = Site.issueUrl(p);
  if (bug) btns.append(el("a", { className: "btn alt", href: bug, rel: "noopener", textContent: "Report a bug" }));
  const share = el("button", { type: "button", className: "btn alt", textContent: "Copy share link" });
  share.addEventListener("click", async () => {
    const url = Site.shareUrl(p.id);
    try { await navigator.clipboard.writeText(url); share.textContent = "Link copied!"; }
    catch (e) { window.prompt("Copy this link:", url); }
    setTimeout(() => { share.textContent = "Copy share link"; }, 2000);
  });
  btns.append(share);
  parts.push(btns);

  if (p.support && p.support.length) parts.push(compatSection(p.support));
  if (p.downloads && p.downloads.length) parts.push(downloadsSection(p.downloads));
  // A changelog typed into projects.js wins; otherwise the one fetched by tools/fetch-changelogs.py (data/changelogs.js)
  const log = (p.changelog && p.changelog.length) ? p.changelog : ((typeof CHANGELOGS !== "undefined" && CHANGELOGS[p.id]) || []);
  if (log.length) parts.push(changelogSection(log));

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
    if (s.list && s.list.length) sec.append(el("ul", { className: "bullets" }, ...s.list.map(t => el("li", { textContent: t }))));
    if (s.chips && s.chips.length) {
      sec.append(el("div", { className: "meta" }, ...s.chips.map(c => el("span", { className: "tag", textContent: c }))));
    }
    parts.push(sec);
  });

  if (p.credits) parts.push(el("section", { className: "sec" }, el("h2", { textContent: "Credits & license" }), el("p", { textContent: p.credits })));

  if (p.timeline && p.timeline.length) parts.push(timelineSection(p.timeline));

  // Stagger the entrance of each block (one-time, CSS does the animating)
  parts.forEach((n, i) => n.style.setProperty("--i", i));
  root.replaceChildren(...parts);

}

p ? render() : notFound();
