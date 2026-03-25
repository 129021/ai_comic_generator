import path from "node:path";

import { readJsonFile } from "../../shared/json.ts";
import { appendFileSuffix, getPreviewConfig } from "../../shared/preview.ts";
import type { ResolvedChapter, ResolvedPanel } from "../../shared/types.ts";
import { renderPanelImage } from "./render-client.ts";
import { buildPreviewPanel } from "./preview-panel.ts";
import { writeRenderStateRecord } from "./render-state.ts";

function getPanel(chapter: ResolvedChapter, panelId: string): ResolvedPanel {
  const panel = chapter.panels.find((item) => item.panel_id === panelId);
  if (!panel) {
    throw new Error(`Panel "${panelId}" not found in ${chapter.chapter_id}.`);
  }

  return panel;
}

export async function renderPanel(
  resolvedChapterPath: string,
  panelId: string,
): Promise<{
  outputPath: string;
  renderStatePath: string;
  renderer: string;
}> {
  const absoluteResolvedPath = path.resolve(process.cwd(), resolvedChapterPath);
  const chapter = await readJsonFile<ResolvedChapter>(absoluteResolvedPath);
  const previewConfig = getPreviewConfig();
  const sourcePanel = getPanel(chapter, panelId);
  const panel = previewConfig.enabled
    ? buildPreviewPanel(sourcePanel, previewConfig)
    : sourcePanel;
  const outputRelativePath = previewConfig.enabled
    ? appendFileSuffix(sourcePanel.output.base_image_path, previewConfig.fileSuffix)
    : sourcePanel.output.base_image_path;
  const outputPath = path.resolve(process.cwd(), outputRelativePath);

  try {
    const result = await renderPanelImage(panel, outputPath);
    const renderStatePath = await writeRenderStateRecord(chapter, panel, result, "rendered");

    return {
      outputPath: result.outputPath,
      renderStatePath,
      renderer: result.renderer,
    };
  } catch (error) {
    const result = {
      outputPath,
      renderer: "unknown",
    };
    const message = error instanceof Error ? error.message : "Unknown render error";
    const renderStatePath = await writeRenderStateRecord(chapter, panel, result, "failed", message);
    throw new Error(`${message}\nRender state updated: ${path.relative(process.cwd(), renderStatePath)}`);
  }
}
