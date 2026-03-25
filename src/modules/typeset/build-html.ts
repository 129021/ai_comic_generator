import { readFile } from "node:fs/promises";
import path from "node:path";

import { getWorkspaceRoot } from "../../core/paths.ts";
import { escapeHtml } from "../../shared/html.ts";
import type {
  BubblePlanItem,
  DialogueItem,
  ResolvedPanel,
} from "../../shared/types.ts";
import { buildBubbleStyle, getBubbleClass } from "./bubble-layout.ts";
import { getFontConfig } from "./font-config.ts";

function findDialogueByText(dialogue: DialogueItem[], text: string): DialogueItem | undefined {
  return dialogue.find((item) => item.text === text);
}

function getBubbleLang(item: BubblePlanItem, panel: ResolvedPanel): "zh" | "en" {
  const dialogueMatch = findDialogueByText(panel.text_content.dialogue, item.text);
  if (dialogueMatch?.lang) {
    return dialogueMatch.lang;
  }

  return /[\u3400-\u9fff]/u.test(item.text) ? "zh" : "en";
}

function buildBubbleMarkup(item: BubblePlanItem, panel: ResolvedPanel): string {
  const lang = getBubbleLang(item, panel);
  const font = getFontConfig(lang);
  const classes = `${getBubbleClass(item.type)} lang-${lang}`;
  const style = `${buildBubbleStyle(item)}font-family:${font.fontFamily};font-size:${font.fontSizePx}px;line-height:${font.lineHeight};`;

  return `<div class="${classes}" style="${style}"><p class="text">${escapeHtml(item.text)}</p></div>`;
}

async function loadTypesetCss(): Promise<string> {
  const filePath = path.join(getWorkspaceRoot(), "src", "templates", "typeset", "styles.css");
  return readFile(filePath, "utf8");
}

export async function buildPanelHtml(panel: ResolvedPanel): Promise<string> {
  const css = await loadTypesetCss();
  const baseImageSrc = `file://${path.join(getWorkspaceRoot(), panel.output.base_image_path)}`;
  const bubbles = panel.text_content.bubble_plan
    .map((item) => buildBubbleMarkup(item, panel))
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(panel.panel_id)}</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <div class="panel">
      <img class="panel-image" src="${escapeHtml(baseImageSrc)}" alt="${escapeHtml(panel.panel_id)}" />
      <div class="overlay">
${bubbles}
      </div>
    </div>
  </body>
</html>
`;
}
