// "Copy link" buttons and the small "Link copied!" notification.
// Use:  Copy.button({ text: "https://...", label: "Copy link", aria: "Copy share link for X" })  -> a <button> element
//       Copy.text("https://...")                                                                 -> copies and shows the notification
// Works without any other script. Needs assets/css/style.css (the .copy-btn and .toast styles).
const Copy = (() => {
  // Static icon (no user text ever goes into innerHTML)
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';

  // The notification: one live region, created up front so screen readers pick up the text when it changes
  const box = document.createElement("div");
  box.className = "toast";
  box.setAttribute("role", "status");
  box.setAttribute("aria-live", "polite");
  box.setAttribute("aria-atomic", "true");
  document.body.append(box);
  let timer = 0;

  function toast(message) {
    clearTimeout(timer);
    box.classList.remove("show");
    box.textContent = "";                                   // empty first, so the same message is announced again
    requestAnimationFrame(() => { box.textContent = message; box.classList.add("show"); });
    timer = setTimeout(() => box.classList.remove("show"), 2200);
  }

  // Clipboard API first (needs https, which GitHub Pages has); old-style fallback for everything else
  async function write(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); return true; }
    } catch (e) { /* fall through to the fallback */ }
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.append(ta);
    ta.select();
    ta.setSelectionRange(0, value.length);
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { /* ignore */ }
    ta.remove();
    return ok;
  }

  async function text(value, message = "Link copied!") {
    const ok = await write(value);
    if (ok) toast(message);
    else window.prompt("Copying didn't work here. Copy this link yourself:", value);   // last resort, so the link is never lost
    return ok;
  }

  // options: text (what gets copied), label (visible text), aria (screen reader text), icon (true = icon only), message, className
  function button({ text: value, label = "Copy link", aria, icon = false, message, className = "" }) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = ("copy-btn " + (icon ? "icon " : "") + className).trim();
    b.innerHTML = ICON + (icon ? "" : "<span></span>");
    if (!icon) b.querySelector("span").textContent = label;
    b.setAttribute("aria-label", aria || label);
    if (icon) b.title = aria || label;
    b.addEventListener("click", () => text(value, message));
    return b;
  }

  return { text, toast, button };
})();
