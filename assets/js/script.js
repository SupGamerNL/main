// Needs data/projects.js + common.js + copy.js loaded first (PROJECTS, Site, Copy)
const { el } = Site;
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const box = document.getElementById("q");
const clearBtn = document.getElementById("q-clear");
const results = document.getElementById("results");
const cats = ["All", ...new Set(PROJECTS.map(p => p.category))];
const hay = new Map(PROJECTS.map(p => [p.id, Site.searchText(p)]));

// Start state comes from the address: index.html?q=forge&cat=Minecraft%20Mods
const params = new URLSearchParams(location.search);
let active = cats.includes(params.get("cat")) ? params.get("cat") : "All";
let query = params.get("q") || "";
box.value = query;

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
// While the boot intro covers the page the cards wait, so their fly-in is seen when the intro opens
let held = document.documentElement.hasAttribute("data-intro");
const waiting = [];
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

function matches(p) {
  if (active !== "All" && p.category !== active) return false;
  const wanted = Site.words(query).split(" ").filter(Boolean);
  return wanted.every(w => hay.get(p.id).includes(" " + w));
}

function card(p, i) {
  const url = Site.projectUrl(p.id);
  const c = Site.cover(p);
  const badge = Site.statusBadge(p);
  const li = el("li", { className: "card" });
  li.dataset.cat = p.category;
  if (c) {
    // Decorative: the title below is the real link, so this one is skipped by keyboards and screen readers
    const a = el("a", { className: "card-cover", href: url, tabIndex: -1 },
      el("img", { src: c.thumb, alt: "", loading: i < 3 ? "eager" : "lazy", decoding: "async", width: 640, height: 360 }));
    a.setAttribute("aria-hidden", "true");
    li.append(a);
  }
  if (badge) li.append(el("div", { className: "card-status" }, badge));
  li.append(
    el("h2", {}, el("a", { className: "title-link", href: url, textContent: p.name })),
    el("p", { textContent: p.description })
  );
  if (p.support && p.support.length) {
    li.append(el("ul", { className: "support" }, ...p.support.map(r => {
      const line = Site.supportLine(r);
      return el("li", {}, ...(r.label ? [el("strong", { textContent: r.label + ": " })] : []), line);
    })));
  }
  li.append(
    el("div", { className: "meta" }, ...[p.category, ...(p.tags || [])].map(t => el("span", { className: "tag", textContent: t }))),
    el("div", { className: "links" },
      el("a", { href: url, textContent: "Details" }),
      ...(p.links || []).slice(0, 2).map(l => el("a", { href: l.url, textContent: l.label })))
  );
  // Copy the share link: a small icon in the top-right corner of the card (see .copy-corner in the CSS)
  li.append(Copy.button({ text: Site.shareUrl(p.id), icon: true, className: "sm copy-corner", aria: "Copy share link for " + p.name }));
  return li;
}

function render(animate) {
  const list = PROJECTS.filter(matches);
  if (io) io.disconnect();
  waiting.length = 0;
  grid.replaceChildren();
  const filtering = query.trim() || active !== "All";
  results.textContent = filtering ? (list.length ? list.length + " of " + PROJECTS.length + " creations" : "No matches") : "";
  clearBtn.hidden = !query;

  if (!list.length) {
    const reset = el("button", { type: "button", className: "btn alt", textContent: "Clear search and filter" });
    reset.addEventListener("click", () => { query = ""; box.value = ""; active = "All"; sync(); renderFilters(); render(true); box.focus(); });
    grid.append(el("li", { className: "empty" }, el("p", { textContent: "Nothing matches that. Try fewer words, a version number or a loader like Forge." }), reset));
    return;
  }
  list.forEach((p, i) => {
    const c = card(p, i);
    grid.append(c);
    if (io && animate) { c.classList.add("pre"); held ? waiting.push(c) : io.observe(c); }
  });
}

// Keep the address in sync so a search or filter can be shared or bookmarked
function sync() {
  const u = new URL(location.href);
  query.trim() ? u.searchParams.set("q", query.trim()) : u.searchParams.delete("q");
  active !== "All" ? u.searchParams.set("cat", active) : u.searchParams.delete("cat");
  history.replaceState(null, "", u.pathname + u.search + u.hash);
}

function renderFilters() {
  filters.replaceChildren(...cats.map(c => {
    const b = el("button", { type: "button", textContent: c });
    b.setAttribute("aria-pressed", String(c === active));
    b.addEventListener("click", () => { active = c; sync(); renderFilters(); render(true); });
    return b;
  }));
}

box.addEventListener("input", () => { query = box.value; sync(); render(false); });
box.addEventListener("keydown", e => { if (e.key === "Escape" && box.value) { box.value = query = ""; sync(); render(false); } });
clearBtn.addEventListener("click", () => { box.value = query = ""; sync(); render(false); box.focus(); });
// Press "/" anywhere to jump to the search box
document.addEventListener("keydown", e => {
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t.matches && t.matches("input, textarea, select, [contenteditable]")) return;
  e.preventDefault(); box.focus();
});

renderFilters();
render(true);
if (held) document.addEventListener("sgintro:reveal", () => { held = false; waiting.forEach(c => io.observe(c)); waiting.length = 0; }, { once: true });

// Hero art: pixel gem (c = cyan, a = aqua, t = turquoise, w = white, b = electric blue, m = electric amber, . = empty)
const GEM = [
  "...tttttt...",
  "..tcwwccat..",
  ".tcwccccaat.",
  "tttttttttttt",
  ".tccwcccabt.",
  "..tcwccabt..",
  "...tccabt...",
  "....tcbt....",
  ".....tm....."
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
Site.renderProfiles(document.getElementById("profiles"));
