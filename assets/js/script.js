// Needs projects.js loaded first (it defines PROJECTS)
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const cats = ["All", ...new Set(PROJECTS.map(p => p.category))];
let active = "All";

function el(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  kids.forEach(k => n.append(k));
  return n;
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = ("IntersectionObserver" in window && !reduce)
  ? new IntersectionObserver((entries) => {
      // Stagger cards that appear in the same batch
      entries.filter(e => e.isIntersecting).forEach((e, i) => {
        const c = e.target;
        c.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
        requestAnimationFrame(() => c.classList.add("in"));
        c.addEventListener("transitionend", function done(ev) {
          if (ev.propertyName !== "transform") return;
          c.classList.remove("pre", "in");
          c.style.removeProperty("--d");
          c.removeEventListener("transitionend", done);
        });
        io.unobserve(c);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
  : null;

// Pause the background pulse when the tab isn't visible
document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("paused", document.hidden);
});

function pageUrl(p) { return "project.html?id=" + encodeURIComponent(p.id); }

function render() {
  grid.replaceChildren();
  const list = PROJECTS.filter(p => active === "All" || p.category === active);
  if (!list.length) { grid.append(el("li", { className: "empty", textContent: "Nothing here yet." })); return; }
  list.forEach(p => {
    const card = el("li", { className: "card" });
    card.dataset.cat = p.category;
    card.append(
      el("h2", {}, el("a", { className: "title-link", href: pageUrl(p), textContent: p.name })),
      el("p", { textContent: p.description }),
      el("div", { className: "meta" }, ...(p.tags || []).map(t => el("span", { className: "tag", textContent: t }))),
      el("div", { className: "links" },
          el("a", { href: pageUrl(p), textContent: "Details" }),
          ...(p.links || []).slice(0, 2).map(l => el("a", { href: l.url, textContent: l.label })))
    );
    grid.append(card);
    if (io) { card.classList.add("pre"); io.observe(card); }
  });
}

function renderFilters() {
  filters.replaceChildren(...cats.map(c => {
    const b = el("button", { type: "button", textContent: c });
    b.setAttribute("aria-pressed", String(c === active));
    b.addEventListener("click", () => { active = c; renderFilters(); render(); });
    return b;
  }));
}

renderFilters();
render();

// Hero art: pixel gem (c = cyan, a = aqua, t = turquoise, w = white, . = empty)
const GEM = [
  "...tttttt...",
  "..tcwwccat..",
  ".tcwccccaat.",
  "tttttttttttt",
  ".tccwcccaat.",
  "..tcwccaat..",
  "...tccaat...",
  "....tcat....",
  ".....tt....."
];
const gem = document.getElementById("gem");
if (gem) {
  const cells = [];
  GEM.join("").split("").forEach((ch, i) => {
    const cell = el("i");
    if (ch === ".") { cell.style.visibility = "hidden"; }
    else {
      if (ch !== "t") cell.dataset.c = ch;
      // A few cells twinkle, with spread-out delays so it never looks synchronized
      if (i % 5 === 0) { cell.classList.add("tw"); cell.style.setProperty("--d", (i * 370 % 5000) + "ms"); }
    }
    cells.push(cell);
  });
  gem.append(...cells);
}

const count = document.getElementById("count");
if (count) {
  const n = PROJECTS.length, m = cats.length - 1;
  count.textContent = n + (n === 1 ? " creation" : " creations") + " in " + m + (m === 1 ? " category" : " categories");
}

// "About me" profile links (from data/profiles.js)
const profiles = document.getElementById("profiles");
if (profiles && typeof PROFILES !== "undefined") {
  profiles.append(...PROFILES.map(p => el("li", {}, el("a", { href: p.url, textContent: p.label }))));
}
