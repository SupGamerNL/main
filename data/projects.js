// ==== Add or change your projects here ====
// id: used in the page link (project.html?id=...). Use lowercase letters, numbers and dashes, and keep it unique.
// category: used for the filter buttons.
// links: shown on the project page (the first two also show on the card). Leave out any you don't need.
// gallery: screenshots, as { file, caption }. Put the full-size file in assets/img/<id>/ and a small version (about 640px wide) in assets/img/<id>/thumbs/, same name.
// page: the extra info for the project page (intro, versions, sections). All parts are optional.
const PROJECTS = [
  {
    id: "mo-ores-n-tools",
    name: "Mo' Ores 'n Tools",
    category: "Minecraft Mods",
    description: "My own Minecraft mod adding extra ores and tools. Available for modern (Neo)Forge, with an older legacy version for 1.10.2 to 1.16.5.",
    tags: ["Mod", "(Neo)Forge"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/moat" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Mo-Ores-n-Tools" }
    ],
    page: {
      intro: "Mo' Ores 'n Tools adds extra ores, alloys, gems and the tools to go with them. It's made by me (SupG_NL) and comes in a modern Reforged version and a legacy version.",
      versions: [
        { name: "Reforged", range: "Modern (Neo)Forge", note: "The current version, built from the ground up again.",
          links: [{ label: "Trello board", url: "https://trello.com/b/48BHW3tG/neoforge-mo-ores-n-tools" }] },
        { name: "Legacy", range: "Minecraft 1.10.2 to 1.16.5", note: "The original version of the mod for older Minecraft releases.",
          links: [{ label: "Trello board", url: "https://trello.com/b/eCEEPdK0/forge-mo-ores-and-tools" }] }
      ],
      sections: [
        { title: "Materials in the works", text: "The materials list for Reforged is still being drafted, so this can change.",
          chips: ["Tin", "Bronze", "Steel", "Nickel", "Invar", "Ruby", "Chromium", "Stainless Steel", "Sapphire"] },
        { title: "Planned", chips: ["Zinc", "Brass", "Titanium", "Tungsten", "Shungite", "Azurite", "Peridot", "Sunstone"] }
      ]
    }
  },
  {
    id: "blood-n-meat",
    name: "Blood 'n Meat",
    category: "Minecraft Mods",
    description: "A Minecraft mod made by me. Available on CurseForge and Modrinth.",
    tags: ["Mod"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/blood-n-meat" },
      { label: "Modrinth", url: "https://modrinth.com/mod/blood-n-meat" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/blood-n-meat" }
    ],
    gallery: [
      { file: "item-frames.webp", caption: "Item frames on a wooden wall showing the mod's red items: a blood drop, a blood blob, a bloodied ingot and a piece of red meat." },
      { file: "crafting-grid.webp", caption: "The crafting grid with an iron ingot and a red blob, showing a bloodied ingot as the result." },
      { file: "campfire-close-up.webp", caption: "A crafting table next to a burning campfire, with a bloodstained item on the fire." },
      { file: "campfire-from-afar.webp", caption: "The same spot from further away, with a red item on the campfire logs and smoke rising." }
    ],
    page: {
      intro: "Blood 'n Meat is a Minecraft mod made by me. You can download it on CurseForge or Modrinth, and the source code is on GitHub."
    }
  },
  {
    id: "hotel-of-secrets",
    name: "Hotel of Secrets",
    category: "Minecraft Worlds",
    description: "A Minecraft world made by me. Download it on CurseForge.",
    tags: ["World"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/hotel-hotel-of-secrets" }
    ],
    page: {
      intro: "Hotel of Secrets is a Minecraft world made by me. You can download it on CurseForge."
    }
  },
  {
    id: "fnaf-map-season-3",
    name: "Fan Made FNAF Map Season 3",
    category: "Minecraft Worlds",
    description: "A fan-made FNAF map for Minecraft, Season 3. Download it on CurseForge.",
    tags: ["World", "FNAF", "Fan-made"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-3" }
    ],
    page: {
      intro: "A fan-made FNAF map for Minecraft, made by me. This is Season 3. You can download it on CurseForge."
    }
  },
  {
    id: "fnaf-map-season-4",
    name: "Fan Made FNAF Map Season 4",
    category: "Minecraft Worlds",
    description: "A fan-made FNAF map for Minecraft, Season 4. Download it on CurseForge.",
    tags: ["World", "FNAF", "Fan-made"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-4" }
    ],
    page: {
      intro: "A fan-made FNAF map for Minecraft, made by me. This is Season 4. You can download it on CurseForge."
    }
  },
  {
    id: "veldoria",
    name: "Veldoria",
    category: "RPG Maker",
    description: "An RPG Maker game made by me. Play it on itch.io.",
    tags: ["RPG Maker", "Game"],
    links: [
      { label: "itch.io", url: "https://supgamernl.itch.io/veldoria" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Veldoria" }
    ],
    page: {
      intro: "Veldoria is an RPG Maker game made by me. You can play it on itch.io, and the project is on GitHub."
    }
  }
];
// ================================================
