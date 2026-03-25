import type { BubblePlanItem, DialogueType } from "../../shared/types.ts";

export interface BubbleLayoutBox {
  top: string;
  left?: string;
  right?: string;
  bottom?: string;
  maxWidth: string;
}

const anchorMap: Record<string, BubbleLayoutBox> = {
  upper_left: { top: "6%", left: "5%", maxWidth: "42%" },
  upper_right: { top: "6%", right: "5%", maxWidth: "42%" },
  top_center: { top: "6%", left: "50%", maxWidth: "52%" },
  mid_left: { top: "38%", left: "5%", maxWidth: "42%" },
  mid_right: { top: "38%", right: "5%", maxWidth: "42%" },
  lower_left: { bottom: "8%", left: "5%", maxWidth: "42%" },
  lower_right: { bottom: "8%", right: "5%", maxWidth: "42%" },
};

export function resolveBubbleAnchor(anchorZone: string): BubbleLayoutBox {
  return anchorMap[anchorZone] ?? anchorMap.upper_left;
}

export function getBubbleClass(type: DialogueType): string {
  switch (type) {
    case "phone_voice":
      return "bubble bubble-phone";
    case "narration":
      return "bubble bubble-narration";
    case "thought":
      return "bubble bubble-thought";
    case "normal":
    default:
      return "bubble bubble-normal";
  }
}

export function buildBubbleStyle(item: BubblePlanItem): string {
  const anchor = resolveBubbleAnchor(item.anchor_zone);
  const declarations = Object.entries(anchor)
    .map(([key, value]) => {
      if (key === "maxWidth") {
        return `max-width:${value}`;
      }

      return `${key}:${value}`;
    })
    .join(";");

  const translate =
    item.anchor_zone === "top_center" ? "transform:translateX(-50%);" : "";

  return `${declarations};${translate}`;
}
