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

function notFound() {
  document.title = "Project not found | SupGamer NL";
  root.append(
    el("a", { className: "back", href: "index.html", textContent: "Back to all creations" }),
    el("h1", { textContent: "Project not found" }),
    el("p", { className: "lead", textContent: "There's no project with that id. Pick one from the index instead." })
  );
}

function render() {
  const page = p.page || {};
  document.title = p.name + " | SupGamer NL";
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = p.description;

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

  if (page.versions && page.versions.length) {
    parts.push(el("section", { className: "sec" },
      el("h2", { textContent: "Versions" }),
      el("div", { className: "versions" },
        ...page.versions.map(v => el("div", { className: "version" },
          el("h3", { textContent: v.name }),
          el("p", { className: "range", textContent: v.range }),
          el("p", { textContent: v.note })
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
