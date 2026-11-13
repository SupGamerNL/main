// Site chrome for every page: the appearance settings, the burger menu of the navigation bar and the cursor spotlight.
(() => {
  /* ---- Appearance settings: theme, text size and motion (saved on this device), plus a hidden 16-bit retro mode.
          The saved choices are applied by a tiny inline script in every page's <head> (so nothing flashes);
          this part builds the settings button + panel.
          Easter egg: click the little amber square at the bottom of the hero gem on the home page. On phones (where the gem is
          hidden) hold the settings button for a second instead. ---- */
  const html = document.documentElement;
  const nav = document.querySelector(".nav");
  const navIn = nav && nav.querySelector(".nav-in");
  const save = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* private mode: just not remembered */ } };

  const isRetro = () => html.hasAttribute("data-retro");
  const GROUPS = [
    { label: "Theme", attr: "theme", key: "sgTheme", opts: [["", "Dark"], ["light", "Light"]] },
    { label: "Text size", attr: "text", key: "sgText", opts: [["s", "Small"], ["", "Normal"], ["l", "Large"], ["xl", "XL"]] },
    { label: "Motion", attr: "motion", key: "sgMotion", opts: [["full", "Full"], ["reduced", "Reduced"], ["off", "Off"]] }
  ];
  const HINT = "Reduced: no looping or background animation, no intro. Off: no animation at all.";

  function setGroup(g, value) {
    value ? html.setAttribute("data-" + g.attr, value) : html.removeAttribute("data-" + g.attr);
    save(g.key, value); // motion keeps an explicit "full", so a system "reduce motion" setting no longer overrides it
  }

  // One small message (the pages with copy.js already have a toast; the others get a minimal one)
  function say(message) {
    if (typeof Copy !== "undefined") return Copy.toast(message);
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(say.t);
    say.t = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function setRetro(on) {
    on ? html.setAttribute("data-retro", "on") : html.removeAttribute("data-retro");
    save("sgRetro", on ? "1" : "");
    say(on ? "16-BIT MODE ON. You found the secret!" : "16-bit mode off.");
    if (render) render();
  }

  let render = null;
  if (navIn) {
    const el = Site.el;
    const btn = el("button", { type: "button", className: "theme-toggle", title: "Appearance settings" });
    btn.setAttribute("aria-label", "Appearance settings");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/></svg>';

    const panel = el("div", { className: "settings", id: "settings", hidden: true });
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Appearance settings");
    btn.setAttribute("aria-controls", "settings");
    const body = el("div");
    const reset = el("button", { type: "button", className: "set-reset", textContent: "Reset to defaults" });
    panel.append(el("p", { className: "set-title", textContent: "Appearance" }), body, reset);
    nav.append(panel);

    render = () => {
      const rows = GROUPS.map(g => {
        const current = html.getAttribute("data-" + g.attr) || (g.attr === "motion" ? "full" : "");
        const seg = el("div", { className: "seg" }, ...g.opts.map(([value, label]) => {
          const b = el("button", { type: "button", textContent: label });
          b.setAttribute("aria-pressed", String(value === current));
          b.addEventListener("click", () => { setGroup(g, value); render(); });
          return b;
        }));
        return el("div", { className: "set-row" }, el("span", { className: "set-label", textContent: g.label }), seg,
          ...(g.attr === "motion" ? [el("p", { className: "set-hint", textContent: HINT })] : []));
      });
      if (isRetro()) {
        const off = el("button", { type: "button", className: "set-reset", textContent: "Turn off" });
        off.addEventListener("click", () => setRetro(false));
        rows.push(el("div", { className: "set-row set-retro" }, el("span", { textContent: "16-bit mode is on" }), off));
      }
      body.replaceChildren(...rows);
    };
    reset.addEventListener("click", () => { GROUPS.forEach(g => { html.removeAttribute("data-" + g.attr); save(g.key, ""); }); render(); });

    const setOpen = open => {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) { render(); nav.classList.remove("open"); const t = nav.querySelector(".nav-toggle"); if (t) t.setAttribute("aria-expanded", "false"); }
    };
    let held = false, timer = 0;
    btn.addEventListener("click", () => { if (held) { held = false; return; } setOpen(panel.hidden); });
    // Phones: hold the button for a second for the hidden mode (the gem is not shown there)
    btn.addEventListener("pointerdown", () => { held = false; timer = setTimeout(() => { held = true; setOpen(false); setRetro(!isRetro()); }, 1000); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => btn.addEventListener(ev, () => clearTimeout(timer)));
    btn.addEventListener("contextmenu", e => e.preventDefault());
    // composedPath() still lists the panel after a button inside it was re-rendered away, so choosing an option keeps the panel open
    document.addEventListener("click", e => { if (!panel.hidden && !e.composedPath().some(n => n === panel || n === btn)) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); btn.focus(); } });
    navIn.append(btn);
  }

  // The hidden switch: the amber square in the hero gem
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest('.gem i[data-c="m"]')) setRetro(!isRetro()); });
})();

(() => {
  /* ---- Burger menu. The bar itself is in the HTML of every page; on screens of 900px or less the CSS
          collapses the links and this opens and closes them. ---- */
  const bar = document.querySelector(".nav");
  const toggle = bar && bar.querySelector(".nav-toggle");
  if (toggle) {
    const isOpen = () => bar.classList.contains("open");
    const setOpen = open => { bar.classList.toggle("open", open); toggle.setAttribute("aria-expanded", String(open)); };
    toggle.addEventListener("click", () => setOpen(!isOpen()));
    bar.addEventListener("click", e => { if (e.target.closest(".nav-links a")) setOpen(false); });          // picking a page closes the menu
    document.addEventListener("click", e => { if (isOpen() && !bar.contains(e.target)) setOpen(false); });   // tapping outside closes it
    document.addEventListener("keydown", e => { if (e.key === "Escape" && isOpen()) { setOpen(false); toggle.focus(); } });
    matchMedia("(min-width: 901px)").addEventListener("change", e => { if (e.matches) setOpen(false); }); // resized or rotated to desktop
  }

  /* ---- Cursor spotlight: a soft glow + brighter grid that follows the mouse. It sits behind all page content
          (see .spot in style.css), so it only lights up the background. Mouse-like devices only: touch screens
          get no extra layer and no listeners. ---- */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const R = 260;   // radius in px (half of .spot width/height in style.css)
  const G = 48;    // grid size in px (the page grid)

  const spot = document.createElement("div");
  const grid = document.createElement("i");   // the brighter grid, wider than the spot so it can slide inside it
  spot.className = "spot";
  spot.setAttribute("aria-hidden", "true");
  spot.append(grid);
  document.body.append(spot);

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, shown = false;

  function draw() {
    raf = 0;
    const k = 0.22; // follow smoothly
    x += (tx - x) * k;
    y += (ty - y) * k;
    const done = Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5;
    if (done) { x = tx; y = ty; }
    const px = Math.round(x - R), py = Math.round(y - R);
    // Both moves are transforms (no repaint): the glow follows the mouse, and the grid inside slides the other way
    // by the leftover (px mod 48), so its lines always stay lined up with the page grid.
    spot.style.transform = `translate3d(${px}px,${py}px,0)`;
    grid.style.transform = `translate3d(${(G - px % G) % G}px,${(G - py % G) % G}px,0)`;
    if (!done) raf = requestAnimationFrame(draw);
  }

  addEventListener("pointermove", e => {
    if (e.pointerType === "touch" || ["reduced", "off"].includes(document.documentElement.dataset.motion)) return; // no glow with reduced motion
    tx = e.clientX; ty = e.clientY;
    if (!shown) { x = tx; y = ty; shown = true; spot.classList.add("on"); }
    if (!raf) raf = requestAnimationFrame(draw); // the loop only runs while the glow is catching up
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => { shown = false; spot.classList.remove("on"); });
})();
