# main
Main repository to host my site. Governs my downloadable content from and for various communities.

© 2026 Jelle "SupGamer NL" Koerselman. All rights reserved.
All original content, software, artwork, designs, documentation and other creative works published in this repository are protected by applicable copyright laws.
No permission is granted to reproduce, modify, redistribute, commercially exploit or otherwise use these works without prior written permission from the copyright holder, except where permitted by applicable law.

---

## Repository structure

```
main/
├── index.html           Home of the site: the index of all creations
├── project.html         Template for every project page (project.html?id=...)
├── gallery.html         The main gallery with all screenshots
├── README.md            This file
├── LICENSE.md           Copyright and usage terms
├── .nojekyll            Tells GitHub Pages to serve the files as they are
│
├── assets/              Everything the pages load
│   ├── css/style.css    All styling and animations
│   ├── js/              script.js (index), project.js, gallery.js, gallery-page.js, nav.js (burger menu), spotlight.js (cursor glow)
│   └── img/             Screenshots: img/<project-id>/ (full size) with thumbs/ inside, plus img/general/
│
├── data/
│   ├── projects.js      The list of projects. The one file to edit when adding something
│   ├── profiles.js      My profile links (YouTube, Patreon, GitHub and so on)
│   └── gallery.js       General screenshots that are not tied to one project
│
└── downloads/           Downloadable content, sorted by community
    ├── minecraft/
    └── rpg-maker/
```

## Adding a project

1. Open `data/projects.js`, copy an existing project block and give it a new unique `id`.
2. Fill in the name, category, description, tags, links and the `page` section.
3. Optional: put screenshots in `assets/img/` and downloads in `downloads/<community>/`, then list them in a `downloads` array (see Downloads below).

The card on the index and the project page are generated from that one entry.

## Adding screenshots

1. Save the full-size image as `assets/img/<project-id>/name.webp` and a small version (about 640px wide) as `assets/img/<project-id>/thumbs/name.webp`.
2. Add `{ file: "name.webp", caption: "What it shows" }` to that project's `gallery` list in `data/projects.js`.
3. It shows up on the project page and in the main gallery automatically.

Screenshots that don't belong to a project go in `assets/img/general/` (and `thumbs/`) and are listed in `data/gallery.js`.

## Navigation

The navigation bar is part of the HTML of every page (`index.html`, `project.html`, `gallery.html`). To add a page, add a link to the `<ul class="nav-links">` list in each of them. On phones and tablets the bar turns into a burger menu, handled by `assets/js/nav.js`.

## SEO and project pages

The homepage links to the pre-rendered project pages at `projects/<project-id>/`. These pages include their own title, description, canonical URL, Open Graph/Twitter metadata, and `CreativeWork` structured data, so search engines and social crawlers can read project information without running JavaScript.

The original `project.html?id=<project-id>` route is still supported for backwards compatibility. When opened in a browser, its JavaScript updates the page metadata and canonical URL to the matching static project page.

When you change project information in `data/projects.js`, regenerate the static pages and sitemap:

```bash
python tools/generate-seo-pages.py
```

The generator uses only Python's standard library. Python is needed only when maintaining/regenerating the pages; the published website remains plain static HTML, CSS and JavaScript. Commit the updated `projects/` pages and `sitemap.xml` together with your `data/projects.js` changes.

`robots.txt` points crawlers to `sitemap.xml`. The sitemap lists the homepage, gallery and each individual project page. The shared social preview image currently uses `assets/img/icon-image.png`.

## Downloads

Every project can offer its files in two ways, and the project page shows a "Downloads" section with a button for each:

- **Download**: the file straight from this site, from the `downloads/` folder (a folder per community, then per project, for example `downloads/minecraft/mods/bnm/`).
- **GitHub Release**: a direct download of the same file from a GitHub Release, plus a small "Release page" link.

Both are set in the `downloads` list of a project in `data/projects.js`:

```js
downloads: [
  { label: "Hotel of Secrets", note: "Minecraft 1.8.9", size: "263 MB",
    release: { tag: "minecraft-map", asset: "Hotel.of.Secrets.zip" } }
]
```

- `file` is the path inside this repo. `release` is the Release tag and the exact asset name. Either one can be left out. `group`, `note` and `size` are optional.
- Browsers can't list folders, so every file needs one entry. Spaces, apostrophes and brackets in file names are handled by the site.
- GitHub rewrites spaces and special characters in release asset names, so give assets a clean name (letters, numbers, dashes, dots) and use that exact name in `asset`.
- Release buttons show while `RELEASES_LIVE` at the top of `data/projects.js` is `true`. Only add a `release` once that Release really exists, otherwise the button leads to a 404 page.
- Files over 100 MB can't live in the repo, so those go in a Release only (Hotel of Secrets and Veldoria do this).
- Direct link format: `https://github.com/<owner>/<repo>/releases/download/<tag>/<asset>`.
- Each file in a GitHub Release can be up to 2 GB.

## License

See [LICENSE.md](LICENSE.md).
