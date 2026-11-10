// Site chrome for every page: the theme button, the burger menu of the navigation bar and the cursor spotlight.
(() => {
  /* ---- Themes: dark (default) / light, plus a hidden 16-bit retro mode on top of either.
          The saved choice is applied by a tiny inline script in every page's <head> (so nothing flashes);
          this part adds the button and the easter egg. Hold the button for a second, or enter the Konami code. ---- */
  const html = document.documentElement;
  const nav = document.querySelector(".nav-in");
  const save = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* private mode: just not remembered */ } };

  const ICON = {
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };

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

  const isLight = () => html.dataset.theme === "light";
  const isRetro = () => html.hasAttribute("data-retro");

  function setRetro(on) {
    on ? html.setAttribute("data-retro", "on") : html.removeAttribute("data-retro");
    save("sgRetro", on ? "1" : "");
    say(on ? "16-BIT MODE ON. Hold the theme button to switch it off." : "16-bit mode off.");
  }

  if (nav) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    const paint = () => {
      const label = isLight() ? "Switch to dark mode" : "Switch to light mode";
      btn.innerHTML = isLight() ? ICON.moon : ICON.sun;
      btn.setAttribute("aria-label", label);
      btn.title = label;
    };
    let held = false, timer = 0;
    btn.addEventListener("click", () => {
      if (held) { held = false; return; }               // that press was the long-press easter egg, not a click
      isLight() ? html.removeAttribute("data-theme") : html.setAttribute("data-theme", "light");
      save("sgTheme", isLight() ? "light" : "");
      paint();
    });
    btn.addEventListener("pointerdown", () => { held = false; timer = setTimeout(() => { held = true; setRetro(!isRetro()); }, 1000); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => btn.addEventListener(ev, () => clearTimeout(timer)));
    btn.addEventListener("contextmenu", e => e.preventDefault());
    paint();
    nav.append(btn);
  }

  // Konami code: up up down down left right left right B A
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let seq = [];
  document.addEventListener("keydown", e => {
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    seq.push(e.key.toLowerCase());
    seq = seq.slice(-KONAMI.length);
    if (seq.join() === KONAMI.join()) { seq = []; setRetro(!isRetro()); }
  });
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
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const spot = document.createElement("div");
  const grid = document.createElement("i");   // the brighter grid, wider than the spot so it can slide inside it
  spot.className = "spot";
  spot.setAttribute("aria-hidden", "true");
  spot.append(grid);
  document.body.append(spot);

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, shown = false;

  function draw() {
    raf = 0;
    const k = reduce ? 1 : 0.22; // follow smoothly, or snap if the visitor prefers reduced motion
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
    if (e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY;
    if (!shown) { x = tx; y = ty; shown = true; spot.classList.add("on"); }
    if (!raf) raf = requestAnimationFrame(draw); // the loop only runs while the glow is catching up
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => { shown = false; spot.classList.remove("on"); });
})();
