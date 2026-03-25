import path from "node:path";

import { readJsonFile } from "../../shared/json.ts";
import type { ResolvedChapter } from "../../shared/types.ts";
import { renderPanel } from "./render-panel.ts";

export async function renderChapter(
  resolvedChapterPath: string,
): Promise<Array<{ panelId: string; outputPath: string; renderer: string }>> {
  const absoluteResolvedPath = path.resolve(process.cwd(), resolvedChapterPath);
  const chapter = await readJsonFile<ResolvedChapter>(absoluteResolvedPath);

  const results = [];
  for (const panel of chapter.panels) {
    const result = await renderPanel(resolvedChapterPath, panel.panel_id);
    results.push({
      panelId: panel.panel_id,
      outputPath: result.outputPath,
      renderer: result.renderer,
    });
  }

  return results;
}
