// Shared gallery code: collects the screenshots, draws thumbnails and runs the lightbox.
// Needs projects.js (PROJECTS) and data/gallery.js (GALLERY_EXTRA) loaded first.
const Gallery = (() => {
  const IMG = "assets/img/";
  const h = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

  // Every screenshot of every project, plus the general ones from data/gallery.js
  function collect() {
    const items = [];
    PROJECTS.forEach(p => (p.gallery || []).forEach(g => items.push({
      src: IMG + p.id + "/" + g.file, thumb: IMG + p.id + "/thumbs/" + g.file,
      caption: g.caption || p.name, project: p.name, id: p.id
    })));
    (typeof GALLERY_EXTRA !== "undefined" ? GALLERY_EXTRA : []).forEach(g => items.push({
      src: IMG + "general/" + g.file, thumb: IMG + "general/thumbs/" + g.file,
      caption: g.caption || "Screenshot", project: "General", id: ""
    }));
    return items;
  }

  // Thumbnail grid. Clicking a thumbnail opens the lightbox on that list.
  function thumbs(container, items) {
    container.replaceChildren(...items.map((it, i) => {
      const img = h("img", { src: it.thumb, alt: it.caption, loading: "lazy", decoding: "async", width: 640, height: 352 });
      const b = h("button", { type: "button", className: "shot" }, img);
      b.setAttribute("aria-label", "Open: " + it.caption);
      b.addEventListener("click", () => openBox(items, i));
      const li = h("li", {}, b);
      li.style.setProperty("--i", Math.min(i, 12));
      return li;
    }));
  }

  // Lightbox (a native <dialog>: Esc closes it and focus is handled by the browser)
  let dlg, img, capText, count, link, prev, next, list = [], pos = 0;

  function build() {
    img = h("img", { alt: "" });
    capText = h("span"); count = h("span", { className: "lb-count" }); link = h("a", { className: "lb-project" });
    prev = h("button", { type: "button", className: "lb-btn lb-prev", textContent: "\u2039" });
    next = h("button", { type: "button", className: "lb-btn lb-next", textContent: "\u203A" });
    const close = h("button", { type: "button", className: "lb-btn lb-close", textContent: "\u00D7", autofocus: true });
    prev.setAttribute("aria-label", "Previous screenshot");
    next.setAttribute("aria-label", "Next screenshot");
    close.setAttribute("aria-label", "Close");
    dlg = h("dialog", { className: "lightbox" }, h("figure", {}, img, h("figcaption", {}, capText, count, link)), prev, next, close);
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    close.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // click outside the picture
    dlg.addEventListener("keydown", e => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });
    let x0 = null; // swipe left/right on touch screens
    dlg.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.body.append(dlg);
  }

  function show() {
    const it = list[pos];
    img.src = it.src; img.alt = it.caption;
    capText.textContent = it.caption;
    count.textContent = list.length > 1 ? (pos + 1) + " / " + list.length : "";
    link.hidden = !it.id;
    if (it.id) { link.href = "project.html?id=" + encodeURIComponent(it.id); link.textContent = it.project; }
    [-1, 1].forEach(d => { new Image().src = list[(pos + d + list.length) % list.length].src; }); // preload neighbours
  }

  function step(d) { pos = (pos + d + list.length) % list.length; show(); }

  function openBox(items, i) {
    if (!dlg) build();
    list = items; pos = i;
    prev.hidden = next.hidden = list.length < 2;
    show();
    dlg.showModal();
  }

  return { collect, thumbs, open: openBox };
})();
