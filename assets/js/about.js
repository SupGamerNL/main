// Needs data/projects.js + data/profiles.js + common.js loaded first.
const { el } = Site;

// "What I make": every project, grouped by category, straight from data/projects.js
const makes = document.getElementById("makes");
if (makes) {
  const cats = [...new Set(PROJECTS.map(p => p.category))];
  makes.replaceChildren(
    ...cats.flatMap(c => [
      el("h3", { textContent: c }),
      el("ul", {}, ...PROJECTS.filter(p => p.category === c).map(p => {
        const badge = Site.statusBadge(p);
        return el("li", {}, el("a", { href: Site.projectUrl(p.id), textContent: p.name }), ...(badge ? [badge] : []));
      }))
    ]),
    el("p", {}, el("a", { href: "index.html", textContent: "Browse everything with search and filters" }))
  );
}

// Profile links (from data/profiles.js); the featured one goes first
Site.renderProfiles(document.getElementById("profiles"));
