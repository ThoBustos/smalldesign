import { landingContent } from "@/content/landing";

export const content = landingContent;

export const heroZones = [
  {
    key: "belief",
    label: "Belief",
    line: content.serviceDetails[0].detail,
    image: content.serviceDetails[0].image,
  },
  {
    key: "made",
    label: "Made",
    line: content.serviceDetails[2].detail,
    image: content.images.hands,
  },
  {
    key: "visible",
    label: "Visible.",
    line: content.serviceDetails[3].detail,
    image: content.serviceDetails[3].image,
  },
] as const;
