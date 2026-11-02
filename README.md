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
│   ├── js/              script.js (index), project.js, gallery.js, gallery-page.js, spotlight.js (cursor glow)
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
3. Optional: put screenshots in `assets/img/` and downloads in `downloads/<community>/`.

The card on the index and the project page are generated from that one entry.

## Adding screenshots

1. Save the full-size image as `assets/img/<project-id>/name.webp` and a small version (about 640px wide) as `assets/img/<project-id>/thumbs/name.webp`.
2. Add `{ file: "name.webp", caption: "What it shows" }` to that project's `gallery` list in `data/projects.js`.
3. It shows up on the project page and in the main gallery automatically.

Screenshots that don't belong to a project go in `assets/img/general/` (and `thumbs/`) and are listed in `data/gallery.js`.

## Downloads

Downloadable content lives in `downloads/`, in a folder per community. Large or versioned files (such as mod `.jar` files) are better published as GitHub Releases and linked from the project page.

## License

See [LICENSE.md](LICENSE.md).
