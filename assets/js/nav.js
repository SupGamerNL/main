// Burger menu for the navigation bar. The bar itself is in the HTML of every page.
// On phones and tablets (900px wide or less) the CSS collapses the links; this script opens and closes them.
(() => {
  const bar = document.querySelector(".nav");
  const toggle = bar && bar.querySelector(".nav-toggle");
  if (!toggle) return;

  const isOpen = () => bar.classList.contains("open");
  const setOpen = open => { bar.classList.toggle("open", open); toggle.setAttribute("aria-expanded", String(open)); };

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  bar.addEventListener("click", e => { if (e.target.closest(".nav-links a")) setOpen(false); });            // picking a page closes the menu
  document.addEventListener("click", e => { if (isOpen() && !bar.contains(e.target)) setOpen(false); });     // tapping outside closes it
  document.addEventListener("keydown", e => { if (e.key === "Escape" && isOpen()) { setOpen(false); toggle.focus(); } });
  matchMedia("(min-width: 901px)").addEventListener("change", e => { if (e.matches) setOpen(false); });     // resized or rotated to desktop
})();
