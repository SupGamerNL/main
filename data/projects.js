// ==== Add or change your projects here ====
// id: used in the page link (project.html?id=...). Use lowercase letters, numbers and dashes, and keep it unique.
// category: used for the filter buttons.
// links: shown on the project page (the first two also show on the card). Leave out any you don't need.
// gallery: screenshots, as { file, caption }. Put the full-size file in assets/img/<id>/ and a small version (about 640px wide) in assets/img/<id>/thumbs/, same name.
//   Tip: python tools/add-screenshots.py <id> <your screenshots>  makes both files and prints the gallery lines for you.
// page: the extra info for the project page (intro, versions, sections). All parts are optional.
// downloads: files for the "Downloads" section on the project page, as
//   { group?, label, note?, size?, file?, release?: { tag, asset } }
//   file    = path inside this repo (for example "downloads/minecraft/mods/bnm/x.jar"). Gives a "Download" button.
//   release = the tag and the exact asset name of a GitHub Release. Gives a "GitHub Release" button (direct download) + a link to the release page.
//   group   = optional heading to sort files under (for example "Legacy").
//   size    = NOT needed any more: file sizes are filled in automatically. Only add it (text like "2.2 MB") as a fallback.
//   Either file or release can be left out.
//
// ---- Optional extras per project ----
// issues    = where "Report a bug" leads for this project (its own GitHub repo's Issues page). Without it the site-wide one in data/config.js is used.
// credits   = a short text for the "Credits & license" section (asset licenses, fan-project disclaimers, thanks).
// page.sections can also hold a `list: ["...", "..."]` (bullet points) next to `text` and `chips`.
// status    = "released", "in-development", "planned", "on-hold" or "archived". Shows a status badge.
// cover     = a file name from the project's screenshots folder (assets/img/<id>/). Shown on the card and the project page.
//             Without it, the first screenshot is used. Without screenshots there is no cover.
// support   = what the project runs on, one row per version line:
//             { label?, game?, engine?, versions?: ["1.21.1"], loader?, requires?: ["Some mod"], note? }
// changelog = [{ version, date?, changes: ["What changed", ...] }], newest first.
// timeline  = [{ date, title, text? }], oldest first. date is free text, for example "2026-03" or "Spring 2026".
//
//   Example (copy into a project, then fill in your own facts):
//   status: "in-development",
//   changelog: [ { version: "0.0.2", date: "2026-11-01", changes: ["Added ..."] } ],
//   timeline: [ { date: "2026-10", title: "Started the project", text: "Optional extra line." } ],

// GitHub repo that holds the Releases ("owner/repo")
const RELEASES_REPO = "SupGamerNL/main";
// Release buttons only show while this is true. Only add a "release" to a download once that Release really exists (otherwise it leads to a 404).
const RELEASES_LIVE = true;

const PROJECTS = [
  {
    id: "mo-ores-n-tools",
    name: "Mo' Ores 'n Tools",
    category: "Minecraft Mods",
    status: "in-development",
    description: "Adds a massive, well-balanced variety of new ores, robust armor sets, and powerful tools for both modern (Neo)Forge and legacy Minecraft versions.",
    tags: ["Mod", "Forge", "NeoForge"],
    support: [
      { label: "Reforged", game: "Minecraft", versions: ["1.21.1"], loader: "NeoForge" },
      { label: "Legacy", game: "Minecraft", versions: ["1.10.2", "1.11.2", "1.12.2", "1.16.5"], loader: "Forge" }
    ],
    issues: "https://github.com/SupGamerNL/Mo-Ores-n-Tools/issues",
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/moat" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Mo-Ores-n-Tools" }
    ],
    gallery: [
      { file: "materials.webp", caption: "A few materials thrown on pillars; from left to right we have: A black pearl, purple orb shard and mud ball. (This is shown from 1.10.2's v1.1.43)" },
      { file: "armor.webp", caption: "An armor set made from Black Pearl. (This is shown from 1.10.2's v1.1.43)" },
      { file: "natural-ores.webp", caption: "Some natural spawning ores within the world, besides the furnace and skeleton. (This is shown from 1.10.2's v1.1.43)" },
      { file: "smelting-tin.webp", caption: "Let's smelt some of that tin ore to tin ingots! (This is shown from 1.10.2's v1.1.43)" },
      { file: "armor-2.webp", caption: "Another armor set and this time made from Blue Pearl. (This is shown from 1.11.2's v2.2.9)" },
      { file: "cover-materials.webp", caption: "And some more materials on pillars; with a red orb, copper dust and obsidian crystal. (This is shown from 1.11.2's v2.2.9)" },
      { file: "mined-item.webp", caption: "Finally I found some wild Black Pearl after I mined its ore! (This is shown from 1.11.2's v2.2.9)" },
      { file: "mining-ore.webp", caption: "In the progress of mining some Black Pearl... (This is shown from 1.11.2's v2.2.9)" },
      { file: "ore-generation.webp", caption: "Oh, what's hidden here, sunstone? (This is shown from 1.11.2's v2.2.9)" }
    ],
    downloads: [
      { group: "Reforged", label: "Minecraft 1.21.1", note: "v0.1.0",
        file: "downloads/minecraft/mods/moat/moat-reforged-1.21.1-v0.1.0.jar" },
      { group: "Legacy", label: "Minecraft 1.10.2", note: "v1.1.43",
        file: "downloads/minecraft/mods/moat/MOAT(Mo' Ores And Tools - 1.10.2 - v1.1.43).jar" },
      { group: "Legacy", label: "Minecraft 1.11.2", note: "v2.2.9 Nature Update v.2",
        file: "downloads/minecraft/mods/moat/MOAT(Mo' Ores And Tools - 1.11.2 - v2.2.9 Nature Update v.2).jar" },
      { group: "Legacy", label: "Minecraft 1.12.2", note: "v3.3.3 Going Mech Patch",
        file: "downloads/minecraft/mods/moat/MOAT(Mo' Ores And Tools - 1.12.2 - v3.3.3 - Going Mech Patch).jar" },
      { group: "Legacy", label: "Minecraft 1.16.5", note: "v6.1.5 Full Release, Advancements Patch",
        file: "downloads/minecraft/mods/moat/MOAT(Mo' Ores and Tools - 1.16.5 - v6.1.5 - Full Release - Advancements Patch).jar" }
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
          chips: ["Garnet", "Tanzanite"] },
        { title: "Planned", chips: ["Tin", "Lead", "Zinc", "Aluminum"] }
      ]
    }
  },
  {
    id: "blood-n-meat",
    name: "Blood 'n Meat",
    category: "Minecraft Mods",
    status: "in-development",
    description: "Introduces new raw and cooked meats, coagulated blood, unique crafting recipes, and immersive survival mechanics that give Minecraft a darker, visceral feel.",
    tags: ["Mod", "NeoForge"],
    support: [
      { game: "Minecraft", versions: ["1.21.8"], loader: "NeoForge" }
    ],
    issues: "https://github.com/SupGamerNL/blood-n-meat/issues",
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
    downloads: [
      { label: "NeoForge 1.21.8", note: "v0.0.1",
        file: "downloads/minecraft/mods/bnm/bnm-0.0.1-neoforge-1.21.8.jar" }
    ],
    page: {
      intro: "Overhauls survival gameplay with gritty new culinary options, blood-harvesting mechanics, and atmospheric crafting"
    }
  },
  {
    id: "hotel-of-secrets",
    name: "Hotel of Secrets",
    category: "Minecraft Maps",
    status: "released",
    description: "An eerie, atmospheric adventure, puzzle, and thriller map designed to keep players on the edge of their seats.",
    tags: ["1.8.9", "Map"],
    support: [
      { game: "Minecraft", versions: ["1.8.9"] }
    ],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/hotel-hotel-of-secrets" }
    ],
    downloads: [
      { label: "Hotel of Secrets", note: "Minecraft 1.8.9",
        release: { tag: "minecraft-map", asset: "Hotel.of.Secrets.zip" } }
    ],
    page: {
      intro: "Step into a chilling, puzzle-filled adventure where every corridor hides a dark secret waiting to be uncovered."
    }
  },
  {
    id: "fnaf-map-season-3",
    name: "Fan Made FNAF Map Season 3",
    category: "Minecraft Maps",
    status: "released",
    description: "A classic fan-made Five Nights at Freddy's map capturing that signature tense, spooky survival horror vibe.",
    tags: ["1.12.2", "Map", "Vanilla"],
    support: [
      { game: "Minecraft", versions: ["1.12.2"], note: "Vanilla" }
    ],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-3" }
    ],
    downloads: [
      { label: "Season 3 map", note: "Minecraft 1.12.2",
        file: "downloads/minecraft/maps/Season 3 Five Nights at Freddy's V2.zip" }
    ],
    page: {
      intro: "A fan-made FNAF map for Minecraft, made by me. This is Season 3. You can download it on CurseForge."
    }
  },
  {
    id: "fnaf-map-season-4",
    name: "Fan Made FNAF Map Season 4",
    category: "Minecraft Maps",
    status: "released",
    description: "An advanced modded FNAF role-playing and adventure map utilizing immersive environment mods like Custom NPCs, Chisel + CTM, and Decocraft.",
    tags: ["1.12.2", "Map", "Modded"],
    support: [
      { game: "Minecraft", versions: ["1.12.2"], requires: ["Custom NPCs", "Chisel + CTM", "Decocraft"], note: "Modded" }
    ],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-4" }
    ],
    downloads: [
      { label: "Season 4 map", note: "Minecraft 1.12.2, modded",
        file: "downloads/minecraft/maps/Season 4 - Five Nights at Freddy.zip" }
    ],
    page: {
      intro: "Season 4 elevates the FNAF Minecraft experience with deep mod integration, custom environments, and enhanced roleplay mechanics."
    }
  },
  {
    id: "veldoria",
    name: "Veldoria",
    category: "RPG Maker",
    status: "in-development",
    description: "An indie RPG Maker fantasy adventure featuring custom storytelling, exploration, and retro charm.",
    tags: ["Game", "v0.1.0"],
    support: [
      { engine: "RPG Maker" }
    ],
    issues: "https://github.com/SupGamerNL/Veldoria/issues",
    credits: "Includes default RPG Maker (MV/MZ) assets, which remain under RPG Maker's own license terms.",
    links: [
      { label: "itch.io", url: "https://supgamernl.itch.io/veldoria" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Veldoria" }
    ],
    downloads: [
      { label: "Veldoria", note: "v0.1.0",
        release: { tag: "rpg-game", asset: "Veldoria.-RPG.Game-.zip" } }
    ],
    page: {
      intro: "An original indie RPG project built with classic retro mechanics, atmospheric soundtracks, and a custom fantasy world."
    }
  },
  {
    id: "legends-reborn",
    name: "The Legend of SupGamer NL - Legends Reborn",
    category: "RPG Maker",
    status: "on-hold",
    description: "A game about a young man with three friends which have the power to save the world.",
    tags: ["Game", "Windows"],
    support: [
      { engine: "RPG Maker", note: "Windows" }
    ],
    links: [
      { label: "itch.io", url: "https://supgamernl.itch.io/legends-of-supgamernl" }
    ],
    credits: "Includes default RPG Maker (MV/MZ) assets, which remain under RPG Maker's own license terms.",
    page: {
      intro: "After sometime when 4 heroes saved the world when they lived in The Netherlands, they moved all together to a different and unknown land, where they split up and lived far apart from each other. Years later the world is in danger again, and it's in need of the lost heroes! What will happen if they don't save the world from a new and fearsome enemy.",
      sections: [
        { title: "Note", text: "The in-game text is converted back to English earlier then expected, but there is a high possibility that the grammar is still incomplete or work in progress." }
      ]
    }
  },
  {
    id: "pokemon-neveo-version",
    name: "Pokémon Neveo version",
    category: "RPG Maker",
    status: "archived",
    description: "In this fangame, you go about the region of Nevelon, a vast region that holds 2 major islands, and in between these 2 islands lies a smaller one, where the Pokémon League is being held.",
    tags: ["Pokémon", "Fan game"],
    support: [
      { engine: "Pokémon Essentials", versions: ["v19.1"] }
    ],
    links: [
      { label: "EeveeExpo thread", url: "https://eeveeexpo.com/threads/4866" }
    ],
    credits: "Pokémon is a trademark of Nintendo, Creatures Inc. and GAME FREAK inc. This is a non-profit fan project and is not affiliated with or endorsed by them. Built with Pokémon Essentials v19.1 and community scripts: Voltseon's PokéSearch, ThatWelshOne_'s Encounter List UI, Deoxysprime's EVs and IVs in Summary, Luka SJ's Elite Battle DX and Golisopod User's Gen 8 Project for PE v19.1.",
    timeline: [
      { date: "2022-03-08", title: "Recruitment post on EeveeExpo", text: "Looking for sprite artists and writers." }
    ],
    page: {
      intro: "A Pokémon fan game project made with Pokémon Essentials v19.1. This page keeps the archived recruitment post from EeveeExpo, which looked for sprite artists and writers.",
      sections: [
        { title: "Unique features", list: [
          "Voltseon's PokéSearch. Search for Pokémon by utilizing certain berries and repels.",
          "ThatWelshOne_'s Encounter List UI. So that you can catch Pokémon to fill up your PokéDex.",
          "Deoxysprime EVs and IVs in Summary. See your Pokémon EVs and IVs in your Pokémon summaries.",
          "Luka SJ's Elite Battle DX. For a more streamlined battling experience.",
          "Golisopod User's Gen 8 Project for PE v19.1. So that most if not all Pokémon are available in the game.",
          "Three new Pokémon types. Sound-type, Digital-type, and Synthetic-type.",
          "Running shoes before you leave your house!",
          "Maybe regional variants.",
          "Gen 5 up to Gen 8 game mechanics.",
          "Toggleable EXP. All key-item.",
          "Trade Pokémon evolve without being traded, they now evolve with an item.",
          "Somewhat inspired by the Netherlands, specifically for (new/regional variants) Pokémon based on animals in the Netherlands.",
          "Nuzlocke Mode. This can be activated before you begin your new adventure, you can also customize some of the rules!",
          "Time Shading, but wild Pokémon are not dependent on the time of day.",
          "No actual evil team, just a cult of chaotic neutral scientists.",
          "Fakemon starter trio, some new Pokémon evolutions, but a PokéDex that is mostly filled with pre-existing Pokémon.",
          "Possibly more features will be added in the future."
        ] },
        { title: "Plot", text: "As of now, there is not a plot to go around. The only plot-related points are as follows;", list: [
          "Your father is the current champion.",
          "Prof. Alder researched new types like the Digital- and Sound-types, his wife is the second professor, who researches Pokémon speech and wants to translate it to human speech.",
          "The third researcher, researches in one specific new type, one that he created, the Synthetic-type.",
          "Ancient Ruins, which hold secrets to a past world."
        ] }
      ]
    }
  }
];
// ================================================
