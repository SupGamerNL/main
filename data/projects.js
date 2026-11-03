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
    description: "Adds a massive, well-balanced variety of new ores, robust armor sets, and powerful tools for both modern (Neo)Forge and legacy Minecraft versions.",
    tags: ["Mod", "Forge", "NeoForge"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/moat" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Mo-Ores-n-Tools" }
    ],
    page: {
      intro: "A comprehensive expansion for Minecraft's underground progression, bringing custom metallurgy, tiered equipment, and active multi-version development.",
      versions: [
        { name: "Reforged", range: "Modern NeoForge; Minecraft 1.21.1", note: "The current version, built from the ground up again.",
          links: [{ label: "Trello board", url: "https://trello.com/b/48BHW3tG/neoforge-mo-ores-n-tools" }] },
        { name: "Legacy", range: "Legacy Forge; Minecraft 1.10.2 to 1.16.5", note: "The original version of the mod for older Minecraft releases.",
          links: [{ label: "Trello board", url: "https://trello.com/b/eCEEPdK0/forge-mo-ores-and-tools" }] }
      ],
      sections: [
        { title: "Materials in the works", text: "The materials list for Reforged is still being drafted, so this can change.",
          chips: ["Tin", "Bronze", "Steel", "Nickel", "Invar", "Ruby", "Chromium"] },
        { title: "Planned", chips: ["Zinc", "Brass", "Titanium", "Tungsten", "Shungite", "Azurite", "Peridot", "Sunstone"] }
      ]
    }
  },
  {
    id: "blood-n-meat",
    name: "Blood 'n Meat",
    category: "Minecraft Mods",
    description: "Introduces new raw and cooked meats, coagulated blood, unique crafting recipes, and immersive survival mechanics that give Minecraft a darker, visceral feel.",
    tags: ["Mod", "NeoForge"],
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
      intro: "Overhauls survival gameplay with gritty new culinary options, blood-harvesting mechanics, and atmospheric crafting"
    }
  },
  {
    id: "hotel-of-secrets",
    name: "Hotel of Secrets",
    category: "Minecraft Maps",
    description: "An eerie, atmospheric adventure, puzzle, and thriller map designed to keep players on the edge of their seats.",
    tags: ["1.8.9", "Map"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/hotel-hotel-of-secrets" }
    ],
    page: {
      intro: "Step into a chilling, puzzle-filled adventure where every corridor hides a dark secret waiting to be uncovered."
    }
  },
  {
    id: "fnaf-map-season-3",
    name: "Fan Made FNAF Map Season 3",
    category: "Minecraft Maps",
    description: "A classic fan-made Five Nights at Freddy's map capturing that signature tense, spooky survival horror vibe.",
    tags: ["1.12.2", "Map", "Vanilla"],
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
    category: "Minecraft Maps",
    description: "An advanced modded FNAF role-playing and adventure map utilizing immersive environment mods like Custom NPCs, Chisel + CTM, and Decocraft.",
    tags: ["1.12.2", "Map", "Modded"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-4" }
    ],
    page: {
      intro: "Season 4 elevates the FNAF Minecraft experience with deep mod integration, custom environments, and enhanced roleplay mechanics."
    }
  },
  {
    id: "veldoria",
    name: "Veldoria",
    category: "RPG Maker",
    description: "An indie RPG Maker fantasy adventure featuring custom storytelling, exploration, and retro charm.",
    tags: ["Game", "v0.1.0"],
    links: [
      { label: "itch.io", url: "https://supgamernl.itch.io/veldoria" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Veldoria" }
    ],
    page: {
      intro: "An original indie RPG project built with classic retro mechanics, atmospheric soundtracks, and a custom fantasy world."
    }
  }
];
// ================================================
