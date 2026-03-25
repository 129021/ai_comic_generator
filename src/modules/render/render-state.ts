import path from "node:path";

import { getRenderStatePathForVariant, getWorkspaceRoot } from "../../core/paths.ts";
import { readJsonFile, writeJsonFile } from "../../shared/json.ts";
import { getPreviewConfig } from "../../shared/preview.ts";
import type {
  RenderPanelResult,
} from "./render-client.ts";
import type {
  RenderStateFile,
  RenderStatePanelRecord,
  ResolvedChapter,
  ResolvedPanel,
} from "../../shared/types.ts";

async function loadExistingRenderState(filePath: string): Promise<RenderStateFile | null> {
  try {
    return await readJsonFile<RenderStateFile>(filePath);
  } catch {
    return null;
  }
}

function buildRecord(
  panel: ResolvedPanel,
  result: RenderPanelResult,
  status: RenderStatePanelRecord["status"],
  lastError: string,
): RenderStatePanelRecord {
  return {
    panel_id: panel.panel_id,
    status,
    output_path: path.relative(getWorkspaceRoot(), result.outputPath),
    workflow_id: panel.resolved_render.workflow_id,
    workflow_file: panel.resolved_render.workflow_file,
    renderer: result.renderer,
    updated_at: new Date().toISOString(),
    last_error: lastError,
  };
}

export async function writeRenderStateRecord(
  chapter: ResolvedChapter,
  panel: ResolvedPanel,
  result: RenderPanelResult,
  status: RenderStatePanelRecord["status"],
  lastError = "",
): Promise<string> {
  const previewConfig = getPreviewConfig();
  const filePath = getRenderStatePathForVariant(
    chapter.project_id,
    chapter.chapter_id,
    previewConfig.enabled ? previewConfig.fileSuffix : undefined,
  );
  const existing = (await loadExistingRenderState(filePath)) ?? {
    project_id: chapter.project_id,
    chapter_id: chapter.chapter_id,
    updated_at: new Date().toISOString(),
    panels: [],
  };

  const nextRecord = buildRecord(panel, result, status, lastError);
  const filtered = existing.panels.filter((item) => item.panel_id !== panel.panel_id);

  const nextState: RenderStateFile = {
    ...existing,
    updated_at: new Date().toISOString(),
    panels: [...filtered, nextRecord].sort((a, b) => a.panel_id.localeCompare(b.panel_id)),
  };

  await writeJsonFile(filePath, nextState);
  return filePath;
}
