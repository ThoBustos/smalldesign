export const designTokens = {
  colors: {
    paper: "#f4f2ec",
    ink: "#050505",
    acid: "#e7ff27",
    blue: "#3159f5",
    soft: "#e8e4d9",
    mutedText: "#77736b",
  },
  spacing: {
    pageX: "clamp(22px, 5vw, 96px)",
    sectionY: "clamp(70px, 10vw, 170px)",
  },
  radii: {
    control: "999px",
    panel: "6px",
  },
} as const;

export type DesignTone = "blue" | "black" | "cream";
export type PanelTone = "dark" | "light";
