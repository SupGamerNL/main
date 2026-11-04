// Builds the main gallery page: all screenshots from every project, with a filter per project.
const root = document.getElementById("gallery");
const all = Gallery.collect();
const mk = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

const names = ["All", ...new Set(all.map(i => i.project))];
let active = "All";
const bar = mk("div", { className: "filters" });
bar.setAttribute("role", "group");
bar.setAttribute("aria-label", "Filter screenshots");
const grid = mk("ul", { className: "shots" });

function draw() {
  Gallery.thumbs(grid, active === "All" ? all : all.filter(i => i.project === active));
  bar.replaceChildren(...names.map(n => {
    const b = mk("button", { type: "button", textContent: n });
    b.setAttribute("aria-pressed", String(n === active));
    b.addEventListener("click", () => { active = n; draw(); });
    return b;
  }));
}

const parts = [
  mk("a", { className: "back", href: "index.html", textContent: "Back to all creations" }),
  mk("h1", { textContent: "Gallery" }),
  mk("p", { className: "lead", textContent: all.length ? "Screenshots from my creations. Click one to see it bigger." : "No screenshots yet." })
];
if (all.length) { parts.push(bar, grid); draw(); }
parts.forEach((n, i) => n.style.setProperty("--i", i));
root.append(...parts);

Stats.view("/gallery", "Gallery");
