// Cursor spotlight: a soft glow + brighter grid that follows the mouse.
// It sits behind all page content (see .spot in style.css), so it only lights up the background.
(() => {
  // Mouse-like devices only. Touch screens skip this entirely (no extra layer, no listeners).
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const R = 260; // radius in px (must match half of .spot width/height in style.css)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const spot = document.createElement("div");
  spot.className = "spot";
  spot.setAttribute("aria-hidden", "true");
  document.body.append(spot);

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, shown = false;

  function draw() {
    raf = 0;
    const k = reduce ? 1 : 0.22; // easing: follow smoothly, or snap if the visitor prefers reduced motion
    x += (tx - x) * k;
    y += (ty - y) * k;
    const done = Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5;
    if (done) { x = tx; y = ty; }
    const px = Math.round(x - R), py = Math.round(y - R);
    // Move with transform (cheap), and shift the grid inside so it stays lined up with the page grid
    spot.style.transform = "translate3d(" + px + "px," + py + "px,0)";
    spot.style.setProperty("--bx", (-px - 1) + "px");
    spot.style.setProperty("--by", (-py - 1) + "px");
    if (!done) raf = requestAnimationFrame(draw);
  }

  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY;
    if (!shown) { x = tx; y = ty; shown = true; spot.classList.add("on"); }
    if (!raf) raf = requestAnimationFrame(draw); // the loop only runs while the glow is catching up
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    shown = false;
    spot.classList.remove("on");
  });
})();
