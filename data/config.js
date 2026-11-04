// ==== Site settings ====
// Used for the SEO tags on every page (canonical links, share previews, structured data).
// If the site ever moves to another address, change "url" here and run:  python tools/update-site.py
const SITE_CONFIG = {
  url: "https://supgamernl.github.io/main/",   // keep the trailing slash
  name: "SupGamer NL",
  author: "Jelle \"SupGamer NL\" Koerselman",
  image: "assets/img/icon-image.png",          // default share image (used when a project has no cover or screenshot)
  imageAlt: "SupGamer NL profile artwork"
};

// ==== Statistics ====
// Release download counts come straight from GitHub (no setup needed).
// Page views and downloads of the files on this site need a free GoatCounter account (https://www.goatcounter.com):
// sign up, pick a code (for example "supgamernl"), enable "Allow adding visitor counts on your website"
// under Settings > Site, then put the code between the quotes. Leave it empty to switch it off.
const STATS_CONFIG = {
  goatcounter: "supgamernl",
  releaseCounts: true      // show how often a GitHub Release file was downloaded
};
// ==========================
