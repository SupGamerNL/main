// Builds the main gallery page: all screenshots from every project, with a filter per project.
// Needs common.js (Site) and gallery.js (Gallery) loaded first.
const root = document.getElementById("gallery");
const all = Gallery.collect();
const mk = Site.el;

const names = ["All", ...new Set(all.map(i => i.project))];
let active = "All";
const bar = mk("div", { className: "filters" });
bar.setAttribute("role", "group");
bar.setAttribute("aria-label", "Filter screenshots");
const grid = mk("ul", { className: "shots" });

// The buttons are built once and only updated, so keyboard focus stays on the one that was used
const buttons = names.map(n => {
  const b = mk("button", { type: "button", textContent: n });
  b.addEventListener("click", () => { active = n; draw(); });
  return b;
});
bar.append(...buttons);

function draw() {
  Gallery.thumbs(grid, active === "All" ? all : all.filter(i => i.project === active));
  buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(names[i] === active)));
}

const parts = [
  Site.breadcrumbs([{ label: "Home", href: Site.here("index.html") }, { label: "Gallery" }]),
  mk("h1", { textContent: "Gallery" }),
  mk("p", { className: "lead", textContent: all.length ? "Screenshots from my creations. Click one to see it bigger." : "No screenshots yet." })
];
if (all.length) { parts.push(bar, grid); draw(); }
parts.forEach((n, i) => n.style.setProperty("--i", Math.min(i, 8)));
root.append(...parts);
