// Needs projects.js loaded first (it defines PROJECTS)
// Opened as project.html?id=<project id>
const root = document.getElementById("project");
const id = new URLSearchParams(location.search).get("id");
const p = PROJECTS.find(x => x.id === id);

function el(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  kids.forEach(k => n.append(k));
  return n;
}

// Encode a path piece for a URL. encodeURIComponent leaves ' ( ) alone, so those are done too
// (file names like "MOAT(Mo' Ores ...).jar" then work everywhere).
function enc(s) { return encodeURIComponent(s).replace(/['()]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase()); }
function fileUrl(path) { return path.split("/").map(enc).join("/"); }
const releasesOn = typeof RELEASES_LIVE !== "undefined" && RELEASES_LIVE && typeof RELEASES_REPO !== "undefined";
const releasesBase = releasesOn ? "https://github.com/" + RELEASES_REPO + "/releases" : "";

function downloadRow(d) {
  const info = el("div", { className: "dl-info" }, el("strong", { textContent: d.label }));
  const sub = [d.note, d.size].filter(Boolean).join(" \u00B7 ");
  if (sub) info.append(el("span", { className: "dl-sub", textContent: sub }));

  const acts = el("div", { className: "dl-acts" });
  if (d.file) {
    // "download" makes the browser save the file instead of opening it (works because it's on the same site)
    acts.append(el("a", { className: "btn", href: fileUrl(d.file), download: "", textContent: "Download" }));
  }
  if (releasesOn && d.release) {
    // A direct link to the release asset: it starts downloading right away
    acts.append(el("a", { className: d.file ? "btn alt" : "btn", href: releasesBase + "/download/" + enc(d.release.tag) + "/" + enc(d.release.asset), textContent: "GitHub Release" }));
    acts.append(el("a", { className: "dl-page", href: releasesBase + "/tag/" + enc(d.release.tag), textContent: "Release page" }));
  }
  const row = el("li", { className: "dl" }, info, acts);
  row.querySelectorAll(".btn").forEach(b => b.setAttribute("aria-label", b.textContent + ": " + d.label));
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

function notFound() {
  document.title = "Project not found | SupGamer NL";
  root.append(
    el("a", { className: "back", href: "index.html", textContent: "Back to all creations" }),
    el("h1", { textContent: "Project not found" }),
    el("p", { className: "lead", textContent: "There's no project with that id. Pick one from the index instead." })
  );
}

function setMeta(selector, attribute, value) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute(attribute, value);
}

function render() {
  const page = p.page || {};
  const canonical = new URL("projects/" + encodeURIComponent(p.id) + "/", "https://supgamernl.github.io/main/").href;
  const title = p.name + " | SupGamer NL";
  document.title = title;
  setMeta('meta[name="description"]', "content", p.description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", p.description);
  setMeta('meta[property="og:url"]', "content", canonical);
  setMeta('link[rel="canonical"]', "href", canonical);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", p.description);

  const parts = [];

  parts.push(el("a", { className: "back", href: "index.html", textContent: "Back to all creations" }));
  parts.push(el("h1", { textContent: p.name }));
  parts.push(el("div", { className: "meta" },
    el("span", { className: "tag", textContent: p.category }),
    ...(p.tags || []).map(t => el("span", { className: "tag", textContent: t }))
  ));
  parts.push(el("p", { className: "lead", textContent: page.intro || p.description }));

  if (p.links && p.links.length) {
    parts.push(el("div", { className: "btns" },
      ...p.links.map(l => el("a", { className: "btn", href: l.url, textContent: l.label }))
    ));
  }

  if (p.downloads && p.downloads.length) parts.push(downloadsSection(p.downloads));

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

  // Stagger the entrance of each block (one-time, CSS does the animating)
  parts.forEach((n, i) => n.style.setProperty("--i", i));
  root.append(...parts);
}

p ? render() : notFound();
