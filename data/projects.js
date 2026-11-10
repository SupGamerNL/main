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
    description: "A vanilla-friendly survival expansion that adds dozens of new ores, tools, armor sets and decorative blocks, expanding Minecraft's material progression without machines or automation. Available for modern NeoForge and legacy Forge versions.",
    tags: ["Mod", "Forge", "NeoForge"],
    support: [
      { label: "Reforged", game: "Minecraft", versions: ["1.21.1"], loader: "NeoForge", note: "Built with MCreator" },
      { label: "Legacy", game: "Minecraft", versions: ["1.10.2", "1.11.2", "1.12.2", "1.16.5"], loader: "Forge" }
    ],
    issues: "https://github.com/SupGamerNL/Mo-Ores-n-Tools/issues",
    credits: "Licensed under the MIT License. You are free to use the mod in modpacks; credit is appreciated but not required. Built with MCreator. Thanks to Mojang for Minecraft and to MCreator for the development tools.",
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/moat" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Mo-Ores-n-Tools" },
      { label: "Wiki", url: "https://supgamernl.github.io/Mo-Ores-n-Tools/wiki.html" }
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
      intro: "Mo' Ores 'n Tools is a survival expansion for Minecraft Java Edition. You mine deeper, discover new materials, craft better gear and progress step by step, with no power systems and no machines. The legacy versions (Minecraft 1.16.5 and earlier) are now considered complete. Development has moved to Reforged, a redesign for Minecraft 1.21.1 and beyond rather than a simple port.",
      versions: [
        { name: "Reforged", range: "Modern NeoForge; Minecraft 1.21.1", note: "The current version, built from the ground up again.",
          links: [{ label: "Trello board", url: "https://trello.com/b/48BHW3tG/neoforge-mo-ores-n-tools" }] },
        { name: "Legacy", range: "Legacy Forge; Minecraft 1.10.2 to 1.16.5", note: "The original version of the mod for older Minecraft releases.",
          links: [{ label: "Trello board", url: "https://trello.com/b/eCEEPdK0/forge-mo-ores-and-tools" }] }
      ],
      sections: [
        { title: "Core features", list: [
          "Dozens of new ores with their own world-generation ranges",
          "Expanded tool and armor progression paths",
          "Decorative stone, ore and material blocks",
          "Survival-balanced gameplay focused on exploration",
          "Simple, intuitive crafting: no power systems, no machines"
        ] },
        { title: "Design philosophy", text: "Vanilla-friendly, progression-focused and low in complexity: you mine, you craft, you progress.", list: [
          "Vanilla-friendly: fits naturally into survival gameplay",
          "Progression-focused: materials matter and upgrades feel earned",
          "Low complexity: depth without automation or tech overload"
        ] },
        { title: "In the legacy versions", text: "The legacy versions add ores that generate in the Overworld and the Nether, such as Tin, Copper, Black Pearl and Blue Pearl, plus items like Strong String and Gears. Most recipes show up in JEI (Just Enough Items). They also include everything from my earlier mod, SupG NL's Crazy Mod." },
        { title: "Version numbers", text: "Files use a custom format, 1.2.3: the first number is the Minecraft version, the second is a major mod update and the third is a minor update or patch. Legacy example: moat-1.16.5-v6.1.5. Reforged example: moat-reforged-1.21.1-v1.0.0." },
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
    description: "Adds new raw and cooked meats, coagulated blood, unique crafting recipes and survival mechanics that give Minecraft a darker, visceral feel.",
    tags: ["Mod", "NeoForge"],
    support: [
      { game: "Minecraft", versions: ["1.21.8"], loader: "NeoForge", note: "Client and server" }
    ],
    issues: "https://github.com/SupGamerNL/blood-n-meat/issues",
    credits: "Licensed under the MIT License.",
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/blood-n-meat" },
      { label: "Modrinth", url: "https://modrinth.com/mod/blood-n-meat" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/blood-n-meat" },
      { label: "Wiki", url: "https://github.com/SupGamerNL/Blood-n-Meat/wiki" }
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
      intro: "Raw. Bloody. Survival intensified. Blood 'n Meat adds new raw and cooked meats, coagulated blood, unique crafting recipes and survival mechanics that give Minecraft a darker, visceral feel.",
      sections: [
        { title: "Early development", text: "The mod is in very early beta (and alpha) development, so I don't recommend installing it just yet." }
      ]
    }
  },
  {
    id: "hotel-of-secrets",
    name: "Hotel of Secrets",
    category: "Minecraft Maps",
    status: "released",
    description: "An adventure, puzzle and thriller map in which you play a detective whose newest case leads to an old, abandoned hotel.",
    tags: ["1.8.9", "Map"],
    support: [
      { game: "Minecraft", versions: ["1.8.9"], requires: ["OptiFine"] }
    ],
    credits: "The resource pack included in the map is made by The Last Day Team.",
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/hotel-hotel-of-secrets" }
    ],
    downloads: [
      { label: "Hotel of Secrets", note: "Minecraft 1.8.9",
        release: { tag: "minecraft-map", asset: "Hotel.of.Secrets.zip" } }
    ],
    page: {
      intro: "You play a detective who was hired by the police to solve cases and mysteries that no one else would take on. When you get a new case, it leads you to an old, abandoned hotel. As you come closer, the air gets heavier and it draws you in, and so your adventure begins.",
      sections: [
        { title: "Before you play", list: [
          "You need OptiFine to play this map.",
          "Multiplayer works too, but every player who joins must download the resource pack first, otherwise it won't work.",
          "The resource pack that is already installed in the map is made by The Last Day Team. Only two textures were changed for this map: the torch is now a flashlight, and the cobweb hangs from the ceiling."
        ] }
      ]
    }
  },
  {
    id: "fnaf-map-season-3",
    name: "Fan Made FNAF Map Season 3",
    category: "Minecraft Maps",
    status: "released",
    description: "A fan-made Five Nights at Freddy's map for FNAF role-playing. It is pure vanilla Minecraft: no mods, and not even OptiFine, needed.",
    tags: ["1.12.2", "Map", "Vanilla"],
    support: [
      { game: "Minecraft", versions: ["1.12.2"], note: "Vanilla, no mods needed. CurseForge also lists it for Minecraft 1.10 to 1.12.1." }
    ],
    credits: "Made with some help from my friend GoldieGames. Five Nights at Freddy's is created by Scott Cawthon; this map is fan-made and not affiliated with him.",
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-3" },
      { label: "Build video", url: "https://www.youtube.com/watch?v=Q_uvowjgWnM" }
    ],
    downloads: [
      { label: "Season 3 map", note: "Minecraft 1.12.2",
        file: "downloads/minecraft/maps/Season 3 Five Nights at Freddy's V2.zip" }
    ],
    page: {
      intro: "This map was made by me (SupGamer NL), with some help from my friend GoldieGames. It is not a remake of Scott Cawthon's official Five Nights at Freddy's 3 game, just a map made for FNAF role-playing. This is Season 3, and you can download it on CurseForge.",
      sections: [
        { title: "Good to know", list: [
          "Totally basic Minecraft, without mods.",
          "It can be played with the normal resource pack, and OptiFine isn't needed.",
          "You can watch how I built the whole map on my YouTube channel, SupGamer NL: search for \"Minecraft | S3 Fan Made FNAF Map Video's\"."
        ] }
      ]
    }
  },
  {
    id: "fnaf-map-season-4",
    name: "Fan Made FNAF Map Season 4",
    category: "Minecraft Maps",
    status: "released",
    description: "A small but fun Five Nights at Freddy's role-playing map with a new and slightly unique look. It uses several mods, including Custom NPCs, Chisel + CTM and Decocraft.",
    tags: ["1.12.2", "Map", "Modded"],
    support: [
      { game: "Minecraft", versions: ["1.12.2"], requires: ["Chisel + CTM", "Custom NPCs", "Decocraft", "MrCrayFish's Furniture", "Placeable Items", "Security Craft", "ThutCore + Thut's Elevator"], note: "Modded. OptiFine is highly recommended." }
    ],
    credits: "Five Nights at Freddy's is created by Scott Cawthon; this map is fan-made and not affiliated with him. Thanks to the authors of the required mods.",
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/worlds/fan-made-fnaf-map-season-4" },
      { label: "Video", url: "https://www.youtube.com/watch?v=55PPkCVMyDA" }
    ],
    downloads: [
      { label: "Season 4 map", note: "Minecraft 1.12.2, modded",
        file: "downloads/minecraft/maps/Season 4 - Five Nights at Freddy.zip" }
    ],
    page: {
      intro: "A small but fun role-playing map for all Five Nights at Freddy's fans who want a new and slightly unique-looking map for role-playing. This is Season 4.",
      sections: [
        { title: "Recommended", text: "I highly recommend using OptiFine, because it has a built-in dynamic lighting system." }
      ]
    }
  },
  {
    id: "veldoria",
    name: "Veldoria",
    category: "RPG Maker",
    status: "in-development",
    description: "A work-in-progress fantasy RPG built with RPG Maker MZ. In a land where steam-driven machines hum beside ancient magic, Morgan must find a way through lost memories and reclaim the truth.",
    tags: ["Game", "v0.1.0"],
    support: [
      { engine: "RPG Maker MZ" }
    ],
    issues: "https://github.com/SupGamerNL/Veldoria/issues",
    credits: "The GitHub repository lists the MIT License. Includes default RPG Maker MZ assets, which remain under RPG Maker's own license terms.",
    links: [
      { label: "itch.io", url: "https://supgamernl.itch.io/veldoria" },
      { label: "GitHub", url: "https://github.com/SupGamerNL/Veldoria" }
    ],
    downloads: [
      { label: "Veldoria", note: "v0.1.0",
        release: { tag: "rpg-game", asset: "Veldoria.-RPG.Game-.zip" } }
    ],
    page: {
      intro: "The Story of Veldoria is an RPG built with RPG Maker MZ. In the land of Veldoria, steam-driven machines hum beside ancient magic, and peace is always fragile. Two childhood friends, Kaelen and Morgan, once shared dreams of greatness: one was chosen to be the hero, and the other was left behind. Now that darkness is rising again, Morgan must find a way through lost memories and reclaim the truth.",
      sections: [
        { title: "Elemental Essence System", list: [
          "Seven primal elements: Neutral, Earth, Fire, Grass, Frost, Thunder and Water",
          "Hybrid forces: Lumen and Umbra bring light and shadow dynamics",
          "Fusion essences: over a dozen secondary and tertiary elements, such as Verdix, Vepres, Pyrus, Solis and Caelus"
        ] },
        { title: "Class evolution paths", text: "You start as a base class (for example Soldier, Mage or Archer), evolve into an advanced class (such as Knight, Caster or Machinist) and then choose a final evolution that reflects your philosophy and elemental affinity.", list: [
          "Morgan Tiaturnus: Deamon Slayer → Deamon Reaver → Eidolo-Bound or Memo-Breaker",
          "Kaelen Markurnium: Marked Hero → Hero → Legendary Hero or Eclipser"
        ] },
        { title: "Dungeons and exploration", text: "The first dungeon, the Temple of the Forgotten Bough deep in Draevenwood Forest, tests your memory, wits and combat skills. Solve puzzles, uncover hidden memories and reclaim the past." },
        { title: "Materials and crafting", text: "Collect Sharp Fangs, Carapaces, Poison Glands and other essence-infused materials, then forge weapons, armor and items that carry the story of the beasts themselves. Trade or craft to suit your preferred playstyle." },
        { title: "Work in progress", text: "This project is a work in progress. Contributions, bug reports and ideas are welcome through pull requests or issues on GitHub." },
        { title: "From the lore", text: "\"A class is not just power; it is purpose. What you become depends not only on what you fight, but on what you remember.\" Veldoriun Marturni, First King of Veldoria" }
      ]
    }
  },
  {
    id: "legends-reborn",
    name: "The Legend of SupGamer NL - Legends Reborn",
    category: "RPG Maker",
    status: "on-hold",
    description: "A game about a young man with three friends who have the power to save the world.",
    tags: ["Game", "Windows"],
    support: [
      { engine: "RPG Maker", note: "Windows" }
    ],
    links: [
      { label: "itch.io", url: "https://supgamernl.itch.io/legends-of-supgamernl" }
    ],
    credits: "Includes default RPG Maker (MV/MZ) assets, which remain under RPG Maker's own license terms.",
    page: {
      intro: "After some time, when four heroes had saved the world while living in the Netherlands, they moved together to a different and unknown land, where they split up and lived far apart from each other. Years later, the world is in danger again and it needs the lost heroes! What will happen if they don't save the world from a new and fearsome enemy?",
      sections: [
        { title: "Genres", chips: ["Role Playing", "Action", "Adventure", "Puzzle", "Strategy"] },
        { title: "Note", text: "The in-game text was converted back to English earlier than expected, but the grammar may still be incomplete or a work in progress." },
        { title: "Suggestions and ideas", text: "With your help the game can become even better, nicer, funnier and more balanced, even though it is still a work in progress." }
      ]
    }
  },
  {
    id: "pokemon-neveo-version",
    name: "Pokémon Neveo version",
    category: "RPG Maker",
    status: "archived",
    description: "In this fan game, you explore the region of Nevelon, a vast region with two major islands. Between them lies a smaller island where the Pokémon League is held.",
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
          "Voltseon's PokéSearch: search for Pokémon by using certain berries and repels.",
          "ThatWelshOne_'s Encounter List UI: so you can catch Pokémon to fill up your PokéDex.",
          "Deoxysprime's EVs and IVs in Summary: see your Pokémon's EVs and IVs in their summaries.",
          "Luka SJ's Elite Battle DX: a more streamlined battling experience.",
          "Golisopod User's Gen 8 Project for PE v19.1: so that most, if not all, Pokémon are available in the game.",
          "Three new Pokémon types: Sound, Digital and Synthetic.",
          "Running shoes before you leave your house!",
          "Maybe regional variants.",
          "Gen 5 up to Gen 8 game mechanics.",
          "Toggleable EXP. All key-item.",
          "Pokémon that evolve by trading evolve without being traded; they now evolve with an item.",
          "Somewhat inspired by the Netherlands, especially the (new and regional variant) Pokémon based on animals from the Netherlands.",
          "Nuzlocke Mode, which you can activate before you begin your new adventure. You can also customize some of the rules!",
          "Time shading, but wild Pokémon are not dependent on the time of day.",
          "No actual evil team, just a cult of chaotic neutral scientists.",
          "A Fakemon starter trio and some new Pokémon evolutions, but a PokéDex that is mostly filled with existing Pokémon.",
          "Possibly more features will be added in the future."
        ] },
        { title: "Plot", text: "As of now, there is no plot. The only plot-related points are as follows:", list: [
          "Your father is the current champion.",
          "Prof. Alder researched new types like the Digital and Sound types. His wife is the second professor, who researches Pokémon speech and wants to translate it into human speech.",
          "The third researcher studies one specific new type that he created: the Synthetic type.",
          "Ancient ruins hold secrets of a past world."
        ] }
      ]
    }
  }
];
// ================================================
