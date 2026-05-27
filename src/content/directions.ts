export const services = ["Naming", "Identity", "Websites", "Product UI", "Launch systems"];

export const signalCases = [
  {
    number: "01",
    label: "Identity system",
    title: "One mark, one type system, one page architecture.",
    variant: "signal" as const,
  },
  {
    number: "02",
    label: "Launch system",
    title: "A website reduced until every section earns the scroll.",
    variant: "launch" as const,
  },
];

export const indexRows = [
  ["01", "Name the thing", "Find the most ownable phrase before drawing the system."],
  ["02", "Make it visible", "Build the mark, type, color, composition, and motion rules."],
  ["03", "Make it usable", "Translate the identity into pages, product states, decks, and launch assets."],
] as const;

export const systemCases = [
  {
    label: "For software teams",
    title: "Brand systems that already know where the buttons go.",
    copy: "Positioning, identity, landing pages, product UI direction, and enough system logic for the next team to keep moving.",
  },
  {
    label: "For founders",
    title: "Launch work without a bloated brand machine.",
    copy: "Sharp language, clear hierarchy, exact components, and a public face that feels considered from day one.",
  },
];

export const systemProofs = ["Small team", "Senior work", "Useful systems", "No filler"];
