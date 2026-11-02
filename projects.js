// ==== Add or change your projects here ====
// id: used in the page link (project.html?id=...). Use lowercase letters, numbers and dashes, and keep it unique.
// category: used for the filter buttons.
// links: shown on the project page (the first two also show on the card). Leave out any you don't need.
// page: the extra info for the project page (intro, versions, sections). All parts are optional.
const PROJECTS = [
  {
    id: "mo-ores-n-tools",
    name: "Mo' Ores 'n Tools",
    category: "Minecraft",
    description: "My own Minecraft mod adding extra ores and tools. Available for modern (Neo)Forge, with an older legacy version for 1.10.2 to 1.16.5.",
    tags: ["Mod", "(Neo)Forge"],
    links: [
      { label: "CurseForge", url: "#" },
      { label: "GitHub", url: "#" },
      { label: "Wiki", url: "#" },
      { label: "Trello", url: "#" }
    ],
    page: {
      intro: "Mo' Ores 'n Tools adds extra ores, alloys, gems and the tools to go with them. It's made by me (SupG_NL) and comes in a modern Reforged version and a legacy version.",
      versions: [
        { name: "Reforged", range: "Modern (Neo)Forge", note: "The current version, built from the ground up again. Also on CurseForge, GitHub (repo and Pages wiki) and Trello." },
        { name: "Legacy", range: "Minecraft 1.10.2 to 1.16.5", note: "The original version of the mod for older Minecraft releases." }
      ],
      sections: [
        { title: "Materials in the works", text: "The materials list for Reforged is still being drafted, so this can change.",
          chips: ["Tin", "Bronze", "Steel", "Nickel", "Invar", "Ruby", "Chromium", "Stainless Steel", "Sapphire"] },
        { title: "Planned", chips: ["Zinc", "Brass", "Titanium", "Tungsten", "Shungite", "Azurite", "Peridot", "Sunstone"] }
      ]
    }
  },
  {
    id: "your-rpg-maker-game",
    name: "Your RPG Maker game",
    category: "RPG Maker",
    description: "Placeholder: write a short blurb about the game here.",
    tags: ["RPG Maker", "Game"],
    links: [
      { label: "Play", url: "#" }
    ],
    page: {
      intro: "Placeholder: tell people what this game is about, who it's for and what makes it fun."
    }
  }
];
// ================================================
