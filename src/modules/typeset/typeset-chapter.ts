import path from "node:path";

import { readJsonFile } from "../../shared/json.ts";
import type { ResolvedChapter } from "../../shared/types.ts";
import { typesetPanel } from "./typeset-panel.ts";

export async function typesetChapter(
  resolvedChapterPath: string,
): Promise<
  Array<{
    panelId: string;
    htmlPath: string;
    pngPath: string;
    pngRendered: boolean;
    baseImageExists: boolean;
  }>
> {
  const absoluteResolvedPath = path.resolve(process.cwd(), resolvedChapterPath);
  const chapter = await readJsonFile<ResolvedChapter>(absoluteResolvedPath);

  const results = [];
  for (const panel of chapter.panels) {
    const result = await typesetPanel(resolvedChapterPath, panel.panel_id);
    results.push({
      panelId: panel.panel_id,
      ...result,
    });
  }

  return results;
}
