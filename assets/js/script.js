// Needs data/projects.js + data/changelogs.js + common.js + copy.js loaded first (PROJECTS, CHANGELOGS, Site, Copy)
const { el } = Site;
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const adv = document.getElementById("adv");
const box = document.getElementById("q");
const clearBtn = document.getElementById("q-clear");
const results = document.getElementById("results");
const cats = ["All", ...new Set(PROJECTS.map(p => p.category))];
const hay = new Map(PROJECTS.map(p => [p.id, Site.searchText(p)]));

// ---- What can be filtered / sorted (everything is read from data/projects.js) ----
const STATUS_ORDER = ["in-development", "planned", "released", "on-hold", "archived"];   // also the "Development status" sort order
const statusList = STATUS_ORDER.filter(s => PROJECTS.some(p => p.status === s));
const supportRows = p => p.support || [];
const versionsOf = p => supportRows(p).flatMap(r => r.versions || []).map(String);
const loadersOf = p => supportRows(p).flatMap(r => String(r.loader || "").split(/\s*(?:\/|,|&|\band\b)\s*/i)).filter(Boolean);
const versionParts = v => v.replace(/^v/i, "").split(".").map(n => parseInt(n, 10) || 0);
const newestFirst = (a, b) => { const x = versionParts(a), y = versionParts(b); for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (y[i] || 0) - (x[i] || 0); return 0; };
const allVersions = [...new Set(PROJECTS.flatMap(versionsOf))].sort(newestFirst);
const allLoaders = [...new Set(PROJECTS.flatMap(loadersOf))].sort((a, b) => a.localeCompare(b));
const count = (test) => PROJECTS.filter(test).length;

const DATES = new Map(PROJECTS.map(p => [p.id, Site.dates(p)]));
const dateOf = (p, field) => Site.dateKey(DATES.get(p.id)[field]);
// Projects without a date are always listed last, whichever direction is chosen
const byDate = (field, dir) => (a, b) => { const x = dateOf(a, field), y = dateOf(b, field); if (!x || !y) return (!x) - (!y); return x === y ? 0 : (x < y ? -dir : dir); };
const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });
const statusRank = p => { const i = STATUS_ORDER.indexOf(p.status); return i < 0 ? 99 : i; };
const SORTS = {
  default: ["Default order", null],
  az: ["Name A to Z", byName],
  za: ["Name Z to A", (a, b) => byName(b, a)],
  updated: ["Recently updated", byDate("updated", -1)],
  released: ["Recently released", byDate("released", -1)],
  oldest: ["Oldest first", byDate("released", 1)],
  status: ["Development status", (a, b) => statusRank(a) - statusRank(b)]
};
const DATE_SORTS = { updated: "updated", released: "released", oldest: "released" };

// ---- Start state comes from the address: index.html?q=forge&cat=Minecraft%20Mods&status=released&ver=1.12.2&loader=Forge&sort=az ----
const params = new URLSearchParams(location.search);
let active = cats.includes(params.get("cat")) ? params.get("cat") : "All";
let query = params.get("q") || "";
let statuses = new Set((params.get("status") || "").split(",").filter(s => statusList.includes(s)));
let ver = allVersions.includes(params.get("ver")) ? params.get("ver") : "";
let loader = allLoaders.includes(params.get("loader")) ? params.get("loader") : "";
let sort = SORTS[params.get("sort")] ? params.get("sort") : "default";
box.value = query;

const motion = document.documentElement.dataset.motion;   // "reduced" | "off" | "full" (explicit choice) | undefined
const reduce = motion ? motion !== "full" : matchMedia("(prefers-reduced-motion: reduce)").matches;
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

const advCount = () => statuses.size + (ver ? 1 : 0) + (loader ? 1 : 0);
const anyFilter = () => !!(query.trim() || active !== "All" || advCount());

function matches(p) {
  if (active !== "All" && p.category !== active) return false;
  if (statuses.size && !statuses.has(p.status)) return false;
  if (ver && !versionsOf(p).includes(ver)) return false;
  if (loader && !loadersOf(p).includes(loader)) return false;
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
  // When sorted by a date, the date is shown too
  const field = DATE_SORTS[sort];
  const when = field && DATES.get(p.id)[field];
  const dateText = field ? (when ? (sort === "updated" ? "Updated " : "Released ") + when : "No date yet") : "";
  if (badge || dateText) li.append(el("div", { className: "card-status" }, ...(badge ? [badge] : []), ...(dateText ? [el("span", { className: "card-date", textContent: dateText })] : [])));
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
    el("div", { className: "meta" }, ...(p.tags || []).map(t => el("span", { className: "tag", textContent: t }))),
    el("div", { className: "links" },
      el("a", { href: url, textContent: "Details" }),
      ...(p.links || []).slice(0, 2).map(l => el("a", { href: l.url, textContent: l.label })))
  );
  // Copy the share link: a small icon in the top-right corner of the card (see .copy-corner in the CSS)
  li.append(Copy.button({ text: Site.shareUrl(p.id), icon: true, className: "sm copy-corner", aria: "Copy share link for " + p.name }));
  return li;
}

function clearAll() {
  query = ""; box.value = ""; active = "All"; statuses.clear(); ver = ""; loader = "";
  sync(); paintControls(); render(true);
}

function render(animate) {
  const list = PROJECTS.filter(matches);
  const order = SORTS[sort][1];
  if (order) list.sort(order);
  if (io) io.disconnect();
  waiting.length = 0;
  grid.replaceChildren();
  results.textContent = anyFilter() ? (list.length ? list.length + " of " + PROJECTS.length + " creations" : "No matches") : "";
  clearBtn.hidden = !query;
  paintControls();

  if (!list.length) {
    const reset = el("button", { type: "button", className: "btn alt", textContent: "Clear search and filters" });
    reset.addEventListener("click", () => { clearAll(); box.focus(); });
    grid.append(el("li", { className: "empty" }, el("p", { textContent: "Nothing matches that. Try fewer words or fewer filters." }), reset));
    return;
  }
  list.forEach((p, i) => {
    const c = card(p, i);
    grid.append(c);
    if (io && animate) { c.classList.add("pre"); held ? waiting.push(c) : io.observe(c); }
  });
}

// Keep the address in sync so a search, filter or sort order can be shared or bookmarked
function sync() {
  const u = new URL(location.href);
  const set = (k, v) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
  set("q", query.trim());
  set("cat", active !== "All" ? active : "");
  set("status", statusList.filter(s => statuses.has(s)).join(","));
  set("ver", ver);
  set("loader", loader);
  set("sort", sort !== "default" ? sort : "");
  history.replaceState(null, "", u.pathname + u.search + u.hash);
}

/* ---- Controls. They are built once and only updated afterwards, so keyboard focus is never lost when one is used. ---- */
const catButtons = cats.map(c => {
  const b = el("button", { type: "button", textContent: c });
  b.addEventListener("click", () => { active = c; sync(); render(true); });
  return b;
});
filters.append(...catButtons);

const statusChips = statusList.map(s => {
  const b = el("button", { type: "button", className: "chip" }, Site.STATUS[s] + " ", el("span", { className: "chip-n", textContent: "(" + count(p => p.status === s) + ")" }));
  b.addEventListener("click", () => { statuses.has(s) ? statuses.delete(s) : statuses.add(s); sync(); render(true); });
  return [s, b];
});
const select = (id, any, values, counter, onChange) => {
  const sel = el("select", { id }, el("option", { value: "", textContent: any }), ...values.map(v => el("option", { value: v, textContent: v + " (" + counter(v) + ")" })));
  sel.addEventListener("change", () => { onChange(sel.value); sync(); render(true); });
  return sel;
};
const verSel = allVersions.length ? select("f-ver", "Any version", allVersions, v => count(p => versionsOf(p).includes(v)), v => { ver = v; }) : null;
const loaderSel = allLoaders.length ? select("f-loader", "Any loader", allLoaders, v => count(p => loadersOf(p).includes(v)), v => { loader = v; }) : null;
const sortSel = el("select", { id: "f-sort" }, ...Object.entries(SORTS).map(([k, [label]]) => el("option", { value: k, textContent: label })));
sortSel.addEventListener("change", () => { sort = sortSel.value; sync(); render(true); });

const toggle = el("button", { type: "button", className: "adv-toggle" }, "Filters", el("span", { className: "adv-n", hidden: true }), el("span", { className: "chev", textContent: "\u25BE" }));
toggle.setAttribute("aria-controls", "adv-panel");
const panel = el("div", { className: "adv-panel", id: "adv-panel" },
  ...(statusChips.length ? [el("div", { className: "adv-group" }, el("span", { className: "set-label", id: "f-status-l", textContent: "Status" }), (() => { const d = el("div", { className: "chips-row", role: "group" }, ...statusChips.map(([, b]) => b)); d.setAttribute("aria-labelledby", "f-status-l"); return d; })())] : []),
  ...(verSel ? [el("div", { className: "adv-group" }, el("label", { className: "set-label", htmlFor: "f-ver", textContent: "Game version" }), verSel)] : []),
  ...(loaderSel ? [el("div", { className: "adv-group" }, el("label", { className: "set-label", htmlFor: "f-loader", textContent: "Loader" }), loaderSel)] : []));
const clearFilters = el("button", { type: "button", className: "adv-clear", textContent: "Clear filters" });
clearFilters.addEventListener("click", () => { clearAll(); toggle.focus(); });
const note = el("p", { className: "adv-note", role: "status" });
adv.append(
  el("div", { className: "adv-bar" }, toggle,
    el("label", { className: "adv-sort", htmlFor: "f-sort" }, "Sort by", sortSel), clearFilters),
  panel, note);

function setPanel(open) { panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); }
toggle.addEventListener("click", () => setPanel(panel.hidden));
setPanel(advCount() > 0);

function paintControls() {
  catButtons.forEach((b, i) => b.setAttribute("aria-pressed", String(cats[i] === active)));
  statusChips.forEach(([s, b]) => b.setAttribute("aria-pressed", String(statuses.has(s))));
  if (verSel) verSel.value = ver;
  if (loaderSel) loaderSel.value = loader;
  sortSel.value = sort;
  const n = advCount();
  const badge = toggle.querySelector(".adv-n");
  badge.hidden = !n; badge.textContent = n;
  clearFilters.hidden = !anyFilter();
  const field = DATE_SORTS[sort];
  const undated = field ? PROJECTS.filter(p => matches(p) && !DATES.get(p.id)[field]).length : 0;
  note.textContent = undated ? undated + (undated === 1 ? " creation has" : " creations have") + " no date yet and " + (undated === 1 ? "is" : "are") + " listed last." : "";
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

const countEl = document.getElementById("count");
if (countEl) {
  const n = PROJECTS.length, m = cats.length - 1;
  countEl.textContent = n + (n === 1 ? " creation" : " creations") + " in " + m + (m === 1 ? " category" : " categories");
}

// "About me" profile links (from data/profiles.js)
Site.renderProfiles(document.getElementById("profiles"));
