# Boot intro: install (3 small edits to index.html ONLY)

New files (just drop them in the repo):
- assets/css/intro.css
- assets/js/intro.js

Nothing to delete. Don't add this to the other pages (project/gallery/about/404), so direct links keep working untouched.

## 1. In index.html <head>, right AFTER your existing `document.documentElement.className = "js";` script

```html
<link rel="stylesheet" href="assets/css/intro.css">
<script>
/* intro gate: decides whether the boot intro plays this visit */
(function(){try{
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;      // reduced motion: no intro
  if(/[?&](q|cat)=/.test(location.search)||location.hash.length>1)return; // filter / #section deep links
  if(sessionStorage.getItem("sgIntro"))return;                           // already played this session
  document.documentElement.setAttribute("data-intro","pending");
}catch(e){}})();
</script>
```

## 2. Add ONE script tag as the FIRST of index.html's deferred scripts (before data/config.js)

```html
<script src="assets/js/intro.js" defer></script>
```

## 3. Hard refresh (Ctrl+F5). To replay it: close the tab / open a new one (sessionStorage), or in DevTools console: `sessionStorage.removeItem("sgIntro")`.

## Tuning
Optional, before intro.js: `<script>window.SG_INTRO = { assemble: 1800, verify: 650, ready: 550 };</script>`
Events if you want to hook in: `sgintro:reveal` (panels start opening) and `sgintro:done`.
