// ==== Site settings ====
// Used for the SEO tags on every page (canonical links, share previews, structured data).
// If the site ever moves to another address, change "url" here and run:  python tools/update-site.py
const SITE_CONFIG = {
  url: "https://supgamernl.github.io/main/",   // keep the trailing slash
  name: "SupGamer NL",
  author: "Jelle \"SupGamer NL\" Koerselman",
  image: "assets/img/icon-image.png",          // default share image (used when a project has no cover or screenshot)
  imageAlt: "SupGamer NL profile artwork",
  // Where "Report a bug" leads. Needs Issues switched on for that GitHub repo.
  // A single project can use its own repo: add  issues: "https://github.com/SupGamerNL/<repo>/issues"  to that project in projects.js.
  issues: "https://github.com/SupGamerNL/main/issues",
  // Where "Questions & feedback" leads (GitHub Discussions must be switched on for that repo). Leave empty ("") to hide the buttons on project pages.
  discussions: "https://github.com/SupGamerNL/main/discussions"
};
