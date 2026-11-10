// Site chrome for every page: the burger menu of the navigation bar and the cursor spotlight.
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
