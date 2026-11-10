/* ==========================================================================
   intro.js - system boot intro (index.html only, once per browser session)
   The inline gate script in index.html decides IF it plays and loads this file + intro.css only then.
   Real load progress drives the bar; the rings are separate HTML layers so the browser animates them
   on the GPU (no per-frame repaints). No libraries, no network requests.
   Document event: "sgintro:reveal" (the panels start opening; the page's own entrance animations run now).
   ========================================================================== */
(() => {
  "use strict";
  const html = document.documentElement;
  if (html.getAttribute("data-intro") !== "pending") return;

  const CFG = {
    assemble: 1800, // min ms of ring-assembly choreography before "VERIFYING"
    initText: 500,  // "SYSTEM INITIALIZING" shows this long before "LOADING ASSETS"
    verify: 450,    // "VERIFYING SYSTEM"
    ready: 450,     // "SYSTEM READY"
    reveal: 1350,   // panels + rings opening (matches the CSS transition lengths)
    maxWait: 8000   // never trap a visitor: continue even if loading is not finished
  };
  // Same values as :root in style.css
  const C = { cyan: "#00E5FF", aqua: "#7FFFD4", turq: "#40E0D0", blue: "#3D8BFF", amber: "#FFBF00", white: "#F4FFFD" };

  try { sessionStorage.setItem("sgIntro", "1"); } catch (e) { /* private mode: it may replay, that's fine */ }

  /* ---------- real progress ---------- */
  let domReady = document.readyState !== "loading", loaded = document.readyState === "complete";
  if (!domReady) document.addEventListener("DOMContentLoaded", () => { domReady = true; }, { once: true });
  addEventListener("load", () => { loaded = true; }, { once: true });

  const urls = [...document.querySelectorAll('link[rel~="stylesheet"][href], script[src]')].map(n => n.href || n.src);
  let assetsDone = 0, assetsTotal = urls.length;

  function measure() {
    const seen = new Set(performance.getEntriesByType("resource").filter(e => e.responseEnd > 0).map(e => e.name));
    const done = loaded ? urls.length : urls.filter(u => seen.has(u)).length;
    // Only images that load right away count (the lazy ones below the fold are not part of "ready")
    const imgs = domReady ? [...document.images].filter(i => i.loading !== "lazy") : [];
    const imgOk = imgs.filter(i => i.complete).length;
    assetsDone = done + imgOk;
    assetsTotal = urls.length + imgs.length;
    return Math.min(1,
      0.45 * (urls.length ? done / urls.length : 1) + (domReady ? 0.2 + 0.25 * (imgs.length ? imgOk / imgs.length : 1) : 0) + (loaded ? 0.1 : 0));
  }

  /* ---------- HUD (every ring is its own <svg> box = its own GPU layer) ---------- */
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
  const f = n => n.toFixed(1);
  const pt = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [300 + r * Math.cos(a), 300 + r * Math.sin(a)]; };
  const arc = (r, a0, a1) => {
    const p = pt(r, a0), q = pt(r, a1), large = ((a1 - a0 + 360) % 360) > 180 ? 1 : 0;
    return `M${f(p[0])} ${f(p[1])}A${r} ${r} 0 ${large} 1 ${f(q[0])} ${f(q[1])}`;
  };
  const circ = (r, a) => `<circle cx="300" cy="300" r="${r}" fill="none" ${a}/>`;
  const path = (d, a) => `<path d="${d}" fill="none" ${a}/>`;
  const dot = (r, deg, size, col, op) => { const p = pt(r, deg); return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${size}" fill="${col}" opacity="${op}"/>`; };
  // One ring: [seconds per turn, "normal" | "reverse"] makes it spin
  const svg = (inner, spin) =>
    `<svg class="sg-svg${spin ? " sg-spin" : ""}" viewBox="0 0 600 600" aria-hidden="true" focusable="false"${spin ? ` style="--sp:${spin[0]}s;--dir:${spin[1]}"` : ""}>${inner}</svg>`;
  // One assembling layer: d = assemble delay, k = scale it expands to on reveal, rd = reveal delay, cls = fly-out direction
  const layer = (cls, d, k, rd, inner) => `<div class="sg-asm ${cls}" style="--d:${d}s;--k:${k};--rd:${rd}s">${inner}</div>`;
  const pulse = (r, spin) => svg(dot(r, 0, 9, C.aqua, .2) + dot(r, 0, 3.4, C.aqua, 1) + dot(r, -7, 2.4, C.aqua, .55) + dot(r, -14, 1.7, C.aqua, .3), spin);

  function buildHUD() {
    seed = 7;
    let o = "";

    // halo + core (plain CSS gradients)
    o += layer("", 0, 1.2, 0.2, '<div class="sg-halo"></div>');
    o += layer("", 0.05, 8, 0, '<div class="sg-core"></div><div class="sg-dot"></div>');

    // ring 46: cyan dashes + bright arc + amber power arc
    o += layer("", 0.2, 2.2, 0, svg(
      circ(46, `stroke="${C.cyan}" stroke-width="1" stroke-opacity=".55" stroke-dasharray="2 5"`) +
      path(arc(46, -20, 70), `stroke="${C.cyan}" stroke-width="3" stroke-linecap="round"`) +
      path(arc(46, 200, 225), `stroke="${C.amber}" stroke-width="3" stroke-linecap="round" class="sg-amber"`), [14, "normal"]));

    // ring 72: turquoise segmented, counter-clockwise
    o += layer("", 0.32, 1.9, 0.03, svg(
      circ(72, `stroke="${C.turq}" stroke-width="5" stroke-opacity=".85" stroke-dasharray="130 20.8"`) +
      circ(62, `stroke="${C.cyan}" stroke-opacity=".25" stroke-width="1"`), [11, "reverse"]));

    // ring 94: electric-blue tick marks
    let ticks = "";
    for (let i = 0; i < 72; i++) {
      const a = pt(88, i * 5), b = pt(i % 6 === 0 ? 101 : 95, i * 5);
      ticks += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
    }
    o += layer("", 0.44, 1.7, 0.06, svg(
      path(ticks, `stroke="${C.blue}" stroke-width="1.2"`) + circ(88, `stroke="${C.blue}" stroke-opacity=".5" stroke-width="1"`), [46, "normal"]));

    // ring 120: two turquoise halves (split left / right on reveal)
    const h120 = `stroke="${C.turq}" stroke-width="2.5" stroke-linecap="round"`;
    o += layer("sg-dr", 0.56, 1, 0.08, svg(path(arc(120, 20, 160), h120) + dot(120, 90, 3, C.turq, 1), [30, "reverse"]));
    o += layer("sg-dl", 0.56, 1, 0.08, svg(path(arc(120, 200, 340), h120) + dot(120, 270, 3, C.turq, 1), [30, "reverse"]));

    // ring 148: circuit traces + nodes
    let tr = "", nodes = "";
    for (let n = 0; n < 30; n++) {
      const ang = n * 12 + rnd() * 6 - 3, r1 = 156 + rnd() * 12, dir = rnd() < 0.5 ? -1 : 1;
      const a2 = ang + dir * (3 + rnd() * 4), r2 = r1 + 6 + rnd() * 9;
      const p0 = pt(148, ang), p1 = pt(r1, ang), p2 = pt(r1, a2), p3 = pt(r2, a2);
      tr += `M${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}L${f(p2[0])} ${f(p2[1])}L${f(p3[0])} ${f(p3[1])}`;
      if (n % 2 === 0) nodes += `<circle cx="${f(p3[0])}" cy="${f(p3[1])}" r="2.2" fill="${C.aqua}"/>`;
    }
    o += layer("", 0.68, 1.5, 0.1, svg(
      circ(148, `stroke="${C.turq}" stroke-opacity=".4" stroke-width="1"`) + path(tr, `stroke="${C.turq}" stroke-width="1.1" stroke-opacity=".9"`) + nodes, [70, "normal"]));

    // ring 178: electric-blue dashed halves (split up / down on reveal)
    const h178 = `stroke="${C.blue}" stroke-width="3.5" stroke-dasharray="38 6"`;
    o += layer("sg-du", 0.8, 1, 0.12, svg(
      path(arc(178, 290, 70), h178) + circ(186, `stroke="${C.blue}" stroke-opacity=".28" stroke-width="1" stroke-dasharray="1 5"`), [38, "reverse"]));
    o += layer("sg-dd", 0.8, 1, 0.12, svg(path(arc(178, 110, 250), h178), [38, "reverse"]));

    // outer plates (fly out to the four edges)
    const plate = (cls, a0, a1) => layer(cls, 0.9, 1, 0.16, svg(
      path(arc(214, a0, a1), `stroke="${C.cyan}" stroke-width="6"`) + path(arc(204, a0 + 4, a1 - 4), `stroke="${C.cyan}" stroke-width="1.2" stroke-opacity=".6"`)));
    o += plate("sg-dr", 52, 128) + plate("sg-dl", 232, 308) + plate("sg-du", 322, 38) + plate("sg-dd", 142, 218);

    // outer dotted ring + amber power indicators
    const amb = [45, 135, 225, 315].map(d => path(arc(198, d - 3, d + 3), `stroke="${C.amber}" stroke-width="5" class="sg-amber" style="animation-delay:${d / 600}s"`)).join("");
    o += layer("", 0.95, 1.25, 0.04, svg(circ(222, `stroke="${C.cyan}" stroke-opacity=".3" stroke-width="1" stroke-dasharray="1 7"`) + amb));

    // slowly rotating technical text
    o += layer("", 0.95, 1.2, 0.02, svg(
      `<defs><path id="sgTP" d="M300 66A234 234 0 1 1 299.9 66"/></defs>` +
      `<text font-size="8.5" fill="${C.blue}" fill-opacity=".85" letter-spacing="1.5" textLength="1460" lengthAdjust="spacing"><textPath href="#sgTP">` +
      "SUPG_NL // SYSTEM CORE // GRID LOCK // NET LINK // 00E5FF // ASSET BUS // SYSTEM CORE // GRID LOCK // NET LINK // 00E5FF // ASSET BUS //</textPath></text>", [90, "normal"]));

    // energy pulses travelling along the rings
    o += layer("", 1.0, 1.3, 0, pulse(72, [6, "normal"]) + pulse(120, [9, "reverse"]) + pulse(148, [7, "reverse"]) + pulse(178, [12, "normal"]));
    return o;
  }

  /* ---------- overlay ---------- */
  let root, bar, pct, metaA, metaT, sr;
  const stEls = {};
  let inerted = [];

  function buildDOM() {
    root = document.createElement("div");
    root.className = "sg-intro";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Site intro");
    root.tabIndex = -1;
    root.innerHTML =
      '<div class="sg-pnl sg-tl"></div><div class="sg-pnl sg-tr"></div><div class="sg-pnl sg-bl"></div><div class="sg-pnl sg-br"></div>' +
      `<div class="sg-stage" aria-hidden="true">${buildHUD()}</div>` +
      '<div class="sg-ui" aria-hidden="true">' +
        '<div class="sg-tag">SUPG_NL // SYSTEM CORE</div>' +
        '<div class="sg-status">' +
          '<div class="sg-stl">' +
            '<span class="sg-st on" data-s="boot">SYSTEM INITIALIZING</span>' +
            '<span class="sg-st" data-s="load">LOADING ASSETS</span>' +
            '<span class="sg-st" data-s="verify">VERIFYING SYSTEM</span>' +
            '<span class="sg-st" data-s="ready">SYSTEM READY</span>' +
          "</div>" +
          '<div class="sg-bar"><div class="sg-track"><div class="sg-fill"></div></div><div class="sg-pct">000%</div></div>' +
          '<div class="sg-meta"><span class="sg-ma">ASSETS 0/0</span><span class="sg-mt">T+0.0s</span></div>' +
        "</div>" +
      "</div>" +
      '<button type="button" class="sg-skip" aria-label="Skip intro">SKIP INTRO &gt;&gt;</button>' +
      '<p class="sg-sr" role="status" aria-live="polite">Loading website</p>';
    document.body.append(root);

    bar = root.querySelector(".sg-fill");
    pct = root.querySelector(".sg-pct");
    metaA = root.querySelector(".sg-ma");
    metaT = root.querySelector(".sg-mt");
    sr = root.querySelector(".sg-sr");
    root.querySelectorAll(".sg-st").forEach(s => { stEls[s.dataset.s] = s; });
    root.querySelector(".sg-skip").addEventListener("click", skip);
    root.addEventListener("wheel", e => e.preventDefault(), { passive: false }); // keep the page behind from scrolling
  }

  // The page behind the intro can't be reached with Tab or a screen reader
  function lock() {
    inerted = [...document.body.children].filter(el => el !== root && !/^(SCRIPT|NOSCRIPT)$/.test(el.tagName) && !el.hasAttribute("inert"));
    inerted.forEach(el => el.setAttribute("inert", ""));
  }
  const setStatus = key => { for (const s in stEls) stEls[s].classList.toggle("on", s === key); };

  /* ---------- sequence ---------- */
  let state = "boot", t0 = 0, tState = 0, raf = 0, finished = false, timer = 0, safety = 0;
  let shown = 0, real = 0, lastMeasure = -1e3, lastMeta = -1e3;

  function enter(next, now) { state = next; tState = now; }

  function tick(now) {
    if (finished) return;
    const el = now - t0;

    if (now - lastMeasure > 90) { real = Math.max(real, measure()); lastMeasure = now; }
    const diff = real - shown;
    shown = Math.abs(diff) < 0.003 ? real : shown + diff * 0.18;
    const txt = ("00" + Math.round(shown * 100)).slice(-3) + "%";
    if (pct.textContent !== txt) { pct.textContent = txt; bar.style.transform = `scaleX(${shown.toFixed(3)})`; }
    if (now - lastMeta > 100) {
      metaA.textContent = `ASSETS ${assetsDone}/${assetsTotal}`;
      metaT.textContent = `T+${(el / 1000).toFixed(1)}s`;
      lastMeta = now;
    }

    if (state === "boot") {
      setStatus(el < CFG.initText ? "boot" : "load");
      if ((real >= 1 && el >= CFG.assemble) || el >= CFG.maxWait) { setStatus("verify"); enter("verify", now); }
    } else if (state === "verify") {
      if (now - tState >= CFG.verify) {
        setStatus("ready");
        root.classList.add("is-ready");
        sr.textContent = "Website ready";
        enter("ready", now);
      }
    } else if (now - tState >= CFG.ready) { // "ready" -> open
      reveal();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function reveal() {
    state = "reveal";
    html.setAttribute("data-intro", "reveal"); // releases the page's own entrance animations
    root.classList.add("is-reveal");
    document.dispatchEvent(new Event("sgintro:reveal"));
    timer = setTimeout(finish, CFG.reveal);
  }

  function cleanup() {
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    clearTimeout(safety);
    document.removeEventListener("keydown", onKey);
    removeEventListener("pageshow", onShow);
    inerted.forEach(el => el.removeAttribute("inert"));
    html.removeAttribute("data-intro");
  }

  function finish() {
    if (finished) return;
    cleanup();
    root.remove();
  }

  function skip() {
    if (finished) return;
    if (state === "reveal") return finish();
    cleanup();
    root.style.pointerEvents = "none";
    root.classList.add("is-skip");
    document.dispatchEvent(new Event("sgintro:reveal"));
    setTimeout(() => root.remove(), 230);
  }

  const onKey = e => { if (e.key === "Escape") skip(); };
  const onShow = e => { if (e.persisted) skip(); }; // restored from the back/forward cache

  /* ---------- go ---------- */
  function start() {
    try {
      buildDOM();
      html.setAttribute("data-intro", "running");
      lock();
      root.focus({ preventScroll: true });
      document.addEventListener("keydown", onKey);
      addEventListener("pageshow", onShow);
      t0 = tState = performance.now();
      raf = requestAnimationFrame(tick);
      safety = setTimeout(skip, CFG.maxWait + 6000); // absolute safety net
    } catch (err) {
      cleanup();
      if (root) root.remove();
      document.dispatchEvent(new Event("sgintro:reveal"));
    }
  }
  // Loaded late by the gate script, so the page may still be parsing
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start();
})();
