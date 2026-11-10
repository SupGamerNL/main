/* ==========================================================================
   intro.js  -  JARVIS-style system boot intro (index.html only)
   - The inline gate in <head> decides IF it plays (sets html[data-intro="pending"]).
   - This file builds the overlay, tracks REAL load progress and runs the sequence.
   - Needs: assets/css/intro.css. No libraries, no network requests.
   Events on document: "sgintro:reveal" (panels start opening), "sgintro:done".
   Optional tuning: define window.SG_INTRO = { assemble: 1800, ... } before this file.
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  if (html.getAttribute("data-intro") !== "pending") return;

  var CFG = {
    assemble: 1800, // min ms of ring-assembly choreography before "VERIFYING"
    initText: 650,  // how long "SYSTEM INITIALIZING" shows before "LOADING ASSETS"
    verify: 650,    // "VERIFYING SYSTEM"
    ready: 550,     // "SYSTEM READY"
    reveal: 1350,   // panels + rings opening (matches CSS transition lengths)
    maxWait: 8000   // never trap a visitor: continue even if loading is not finished
  };
  if (window.SG_INTRO) for (var k in window.SG_INTRO) CFG[k] = window.SG_INTRO[k];

  var root, bar, pct, metaA, metaT, sr, stEls = {}, inerted = [];
  var state = "boot", t0 = 0, tState = 0, raf = 0, finished = false, timers = [];
  var shown = 0, real = 0, lastMeasure = -1e3, lastMeta = -1e3;
  var domReady = document.readyState === "complete", loaded = document.readyState === "complete";

  try { sessionStorage.setItem("sgIntro", "1"); } catch (e) {}

  /* ---------- real progress ---------- */
  document.addEventListener("DOMContentLoaded", function () { domReady = true; });
  window.addEventListener("load", function () { loaded = true; });

  var urls = [];
  (function () {
    var els = document.querySelectorAll('link[rel~="stylesheet"][href], script[src]');
    for (var i = 0; i < els.length; i++) {
      var u = els[i].href || els[i].src;
      if (u) urls.push(u);
    }
  })();

  var assetsDone = 0, assetsTotal = urls.length;

  function measure() {
    var seen = {}, es = performance.getEntriesByType ? performance.getEntriesByType("resource") : [];
    for (var i = 0; i < es.length; i++) if (es[i].responseEnd > 0) seen[es[i].name] = 1;
    var done = 0;
    for (var j = 0; j < urls.length; j++) if (seen[urls[j]] || document.readyState === "complete") done++;

    // images currently in the viewport (cards are lazy-loaded, so only count what is visible)
    var imgTotal = 0, imgOk = 0;
    if (domReady) {
      var imgs = document.images, vh = window.innerHeight;
      for (var n = 0; n < imgs.length && imgTotal < 12; n++) {
        var r = imgs[n].getBoundingClientRect();
        if (!r.width || r.top >= vh || r.bottom <= 0) continue;
        imgTotal++;
        if (imgs[n].complete) imgOk++;
      }
    }
    assetsDone = done + imgOk;
    assetsTotal = urls.length + imgTotal;

    var v = 0.45 * (urls.length ? done / urls.length : 1) +
            (domReady ? 0.20 : 0) +
            (domReady ? 0.25 * (imgTotal ? imgOk / imgTotal : 1) : 0) +
            (loaded ? 0.10 : 0);
    return Math.max(real, Math.min(1, v));
  }

  /* ---------- SVG HUD ---------- */
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function f(n) { return n.toFixed(1); }
  function pt(r, deg) { var a = (deg - 90) * Math.PI / 180; return [300 + r * Math.cos(a), 300 + r * Math.sin(a)]; }
  function arc(r, a0, a1) {
    var p = pt(r, a0), q = pt(r, a1), large = ((a1 - a0 + 360) % 360) > 180 ? 1 : 0;
    return "M" + f(p[0]) + " " + f(p[1]) + "A" + r + " " + r + " 0 " + large + " 1 " + f(q[0]) + " " + f(q[1]);
  }
  function L(cls, d, k, rd, inner) {
    return '<g class="sg-asm ' + cls + '" style="--d:' + d + "s;--k:" + k + ";--rd:" + rd + 's">' + inner + "</g>";
  }
  function S(sp, dir, inner) {
    return '<g class="sg-spin" style="--sp:' + sp + "s;--dir:" + dir + '">' + inner + "</g>";
  }
  function circ(r, a) { return '<circle cx="300" cy="300" r="' + r + '" fill="none" ' + a + "/>"; }
  function path(d, a) { return '<path d="' + d + '" fill="none" ' + a + "/>"; }
  function dot(r, deg, size, col, op) {
    var p = pt(r, deg);
    return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + size + '" fill="' + col + '" opacity="' + op + '"/>';
  }
  function pulse(r, sp, dir) {
    return S(sp, dir,
      dot(r, 0, 9, "#7FFFD4", 0.2) + dot(r, 0, 3.4, "#7FFFD4", 1) +
      dot(r, -7, 2.4, "#7FFFD4", 0.55) + dot(r, -14, 1.7, "#7FFFD4", 0.3));
  }

  function buildSVG() {
    seed = 7;
    var o = '<svg class="sg-hud" viewBox="0 0 600 600" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="sgG1"><stop offset="0" stop-color="#00E5FF" stop-opacity=".30"/><stop offset="1" stop-color="#00E5FF" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="sgG2"><stop offset="0" stop-color="#F4FFFD"/><stop offset=".3" stop-color="#00E5FF"/><stop offset="1" stop-color="#00E5FF" stop-opacity="0"/></radialGradient>' +
      '<path id="sgTP" d="M300 66A234 234 0 1 1 299.9 66"/></defs>';

    // halo + core
    o += L("", 0, 1.2, 0.2, '<circle cx="300" cy="300" r="230" fill="url(#sgG1)"/>');
    o += L("", 0.05, 8, 0, '<circle class="sg-core-glow" cx="300" cy="300" r="34" fill="url(#sgG2)"/><circle cx="300" cy="300" r="5" fill="#F4FFFD"/>');

    // ring 46: cyan dashes + bright arc + amber power arc
    o += L("", 0.2, 2.2, 0, S(14, "normal",
      circ(46, 'stroke="#00E5FF" stroke-width="1" stroke-opacity=".55" stroke-dasharray="2 5"') +
      path(arc(46, -20, 70), 'stroke="#00E5FF" stroke-width="3" stroke-linecap="round"') +
      path(arc(46, 200, 225), 'stroke="#FFBF00" stroke-width="3" stroke-linecap="round" class="sg-amber"')));

    // ring 72: turquoise segmented, counter-clockwise
    o += L("", 0.32, 1.9, 0.03, S(11, "reverse",
      circ(72, 'stroke="#40E0D0" stroke-width="5" stroke-opacity=".85" stroke-dasharray="130 20.8"') +
      circ(62, 'stroke="#00E5FF" stroke-opacity=".25" stroke-width="1"')));

    // ring 94: electric-blue tick marks
    var ticks = "";
    for (var i = 0; i < 72; i++) {
      var long = i % 6 === 0, a = pt(88, i * 5), b = pt(long ? 101 : 95, i * 5);
      ticks += "M" + f(a[0]) + " " + f(a[1]) + "L" + f(b[0]) + " " + f(b[1]);
    }
    o += L("", 0.44, 1.7, 0.06, S(46, "normal",
      path(ticks, 'stroke="#3B82F6" stroke-width="1.2"') + circ(88, 'stroke="#3B82F6" stroke-opacity=".5" stroke-width="1"')));

    // ring 120: two turquoise halves (split left / right on reveal)
    var h120 = 'stroke="#40E0D0" stroke-width="2.5" stroke-linecap="round"';
    o += L("sg-dr", 0.56, 1, 0.08, S(30, "reverse", path(arc(120, 20, 160), h120) + dot(120, 90, 3, "#40E0D0", 1)));
    o += L("sg-dl", 0.56, 1, 0.08, S(30, "reverse", path(arc(120, 200, 340), h120) + dot(120, 270, 3, "#40E0D0", 1)));

    // ring 148: circuit traces + nodes
    var tr = "", nodes = "";
    for (var n = 0; n < 30; n++) {
      var ang = n * 12 + rnd() * 6 - 3, r1 = 156 + rnd() * 12, dir = rnd() < 0.5 ? -1 : 1;
      var a2 = ang + dir * (3 + rnd() * 4), r2 = r1 + 6 + rnd() * 9;
      var p0 = pt(148, ang), p1 = pt(r1, ang), p2 = pt(r1, a2), p3 = pt(r2, a2);
      tr += "M" + f(p0[0]) + " " + f(p0[1]) + "L" + f(p1[0]) + " " + f(p1[1]) +
            "L" + f(p2[0]) + " " + f(p2[1]) + "L" + f(p3[0]) + " " + f(p3[1]);
      if (n % 2 === 0) nodes += '<circle cx="' + f(p3[0]) + '" cy="' + f(p3[1]) + '" r="2.2" fill="#7FFFD4"/>';
    }
    o += L("", 0.68, 1.5, 0.1, S(70, "normal",
      circ(148, 'stroke="#40E0D0" stroke-opacity=".4" stroke-width="1"') +
      path(tr, 'stroke="#40E0D0" stroke-width="1.1" stroke-opacity=".9"') + nodes));

    // ring 178: electric-blue dashed halves (split up / down on reveal)
    var h178 = 'stroke="#3B82F6" stroke-width="3.5" stroke-dasharray="38 6"';
    o += L("sg-du", 0.8, 1, 0.12, S(38, "reverse", path(arc(178, 290, 70), h178) + circ(186, 'stroke="#3B82F6" stroke-opacity=".28" stroke-width="1" stroke-dasharray="1 5"')));
    o += L("sg-dd", 0.8, 1, 0.12, S(38, "reverse", path(arc(178, 110, 250), h178)));

    // outer plates (fly out to the four edges)
    function plate(cls, a0, a1) {
      return L(cls, 0.9, 1, 0.16,
        path(arc(214, a0, a1), 'stroke="#00E5FF" stroke-width="6"') +
        path(arc(204, a0 + 4, a1 - 4), 'stroke="#00E5FF" stroke-width="1.2" stroke-opacity=".6"'));
    }
    o += plate("sg-dr", 52, 128) + plate("sg-dl", 232, 308) + plate("sg-du", 322, 38) + plate("sg-dd", 142, 218);

    // outer dotted ring + amber power indicators + rotating technical text
    var amb = "";
    [45, 135, 225, 315].forEach(function (d) {
      amb += path(arc(198, d - 3, d + 3), 'stroke="#FFBF00" stroke-width="5" class="sg-amber" style="animation-delay:' + (d / 600) + 's"');
    });
    o += L("", 0.95, 1.25, 0.04, circ(222, 'stroke="#00E5FF" stroke-opacity=".3" stroke-width="1" stroke-dasharray="1 7"') + amb);
    o += L("", 0.95, 1.2, 0.02, S(90, "normal",
      '<text font-size="8.5" fill="#3B82F6" fill-opacity=".85" letter-spacing="1.5" textLength="1460" lengthAdjust="spacing">' +
      '<textPath href="#sgTP">SUPG_NL // SYSTEM CORE // GRID LOCK // NET LINK // 00E5FF // ASSET BUS // SYSTEM CORE // GRID LOCK // NET LINK // 00E5FF // ASSET BUS //</textPath></text>'));

    // energy pulses travelling along the rings
    o += L("", 1.0, 1.3, 0, pulse(72, 6, "normal") + pulse(120, 9, "reverse") + pulse(148, 7, "reverse") + pulse(178, 12, "normal"));

    return o + "</svg>";
  }

  /* ---------- overlay ---------- */
  function buildDOM() {
    root = document.createElement("div");
    root.className = "sg-intro";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Site intro");
    root.tabIndex = -1;
    root.innerHTML =
      '<div class="sg-pnl sg-tl"></div><div class="sg-pnl sg-tr"></div><div class="sg-pnl sg-bl"></div><div class="sg-pnl sg-br"></div>' +
      '<div class="sg-stage">' + buildSVG() + "</div>" +
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
    document.body.appendChild(root);

    bar = root.querySelector(".sg-fill");
    pct = root.querySelector(".sg-pct");
    metaA = root.querySelector(".sg-ma");
    metaT = root.querySelector(".sg-mt");
    sr = root.querySelector(".sg-sr");
    var st = root.querySelectorAll(".sg-st");
    for (var i = 0; i < st.length; i++) stEls[st[i].getAttribute("data-s")] = st[i];

    root.querySelector(".sg-skip").addEventListener("click", skip);
    // keep the page behind from scrolling while the intro is up
    root.addEventListener("wheel", function (e) { e.preventDefault(); }, { passive: false });
  }

  function lock() {
    var kids = document.body.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el === root || el.tagName === "SCRIPT" || el.tagName === "NOSCRIPT" || el.hasAttribute("inert")) continue;
      el.setAttribute("inert", "");
      inerted.push(el);
    }
  }
  function unlock() {
    for (var i = 0; i < inerted.length; i++) inerted[i].removeAttribute("inert");
    inerted = [];
  }

  function setStatus(key) {
    for (var s in stEls) stEls[s].classList.toggle("on", s === key);
  }

  /* ---------- sequence ---------- */
  function enter(next, now) { state = next; tState = now; }

  function tick(now) {
    if (finished) return;
    var el = now - t0;

    if (now - lastMeasure > 90) { real = measure(); lastMeasure = now; }
    var diff = real - shown;
    shown = Math.abs(diff) < 0.003 ? real : shown + diff * 0.18;
    var p = Math.round(shown * 100);
    var txt = ("00" + p).slice(-3) + "%";
    if (pct.textContent !== txt) { pct.textContent = txt; bar.style.transform = "scaleX(" + shown.toFixed(3) + ")"; }
    if (now - lastMeta > 100) {
      metaA.textContent = "ASSETS " + assetsDone + "/" + assetsTotal;
      metaT.textContent = "T+" + (el / 1000).toFixed(1) + "s";
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
    } else if (state === "ready") {
      if (now - tState >= CFG.ready) { reveal(); return; }
    }
    raf = requestAnimationFrame(tick);
  }

  function reveal() {
    state = "reveal";
    html.setAttribute("data-intro", "reveal"); // lets the page's own entrance animations run
    root.classList.add("is-reveal");
    document.dispatchEvent(new CustomEvent("sgintro:reveal"));
    timers.push(setTimeout(finish, CFG.reveal));
  }

  function cleanup() {
    finished = true;
    cancelAnimationFrame(raf);
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("pageshow", onShow);
    unlock();
    html.removeAttribute("data-intro");
  }

  function finish() {
    if (finished) return;
    cleanup();
    if (root && root.parentNode) root.parentNode.removeChild(root);
    document.dispatchEvent(new CustomEvent("sgintro:done"));
  }

  function skip() {
    if (finished) return;
    var wasRevealing = state === "reveal";
    if (wasRevealing) return finish();
    cleanup();
    root.style.pointerEvents = "none";
    root.classList.add("is-skip");
    document.dispatchEvent(new CustomEvent("sgintro:reveal"));
    setTimeout(function () {
      if (root.parentNode) root.parentNode.removeChild(root);
      document.dispatchEvent(new CustomEvent("sgintro:done"));
    }, 230);
  }

  function onKey(e) { if (e.key === "Escape") skip(); }
  function onShow(e) { if (e.persisted) skip(); } // restored from back/forward cache

  /* ---------- go ---------- */
  try {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.removeAttribute("data-intro");
      return;
    }
    buildDOM();
    html.setAttribute("data-intro", "running");
    lock();
    root.focus({ preventScroll: true });
    document.addEventListener("keydown", onKey);
    window.addEventListener("pageshow", onShow);
    t0 = performance.now();
    tState = t0;
    raf = requestAnimationFrame(tick);
    timers.push(setTimeout(function () { if (!finished) skip(); }, CFG.maxWait + 6000)); // absolute safety net
  } catch (err) {
    cleanup();
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }
})();
