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
├── README.md            This file
├── LICENSE.md           Copyright and usage terms
├── .nojekyll            Tells GitHub Pages to serve the files as they are
│
├── assets/              Everything the pages load
│   ├── css/style.css    All styling and animations
│   ├── js/              script.js (index), project.js (project pages), spotlight.js (cursor glow)
│   └── img/             Screenshots, banners and icons
│
├── data/
│   ├── projects.js      The list of projects. The one file to edit when adding something
│   └── profiles.js      My profile links (YouTube, Patreon, GitHub and so on)
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

## Downloads

Downloadable content lives in `downloads/`, in a folder per community. Large or versioned files (such as mod `.jar` files) are better published as GitHub Releases and linked from the project page.

## License

See [LICENSE.md](LICENSE.md).
