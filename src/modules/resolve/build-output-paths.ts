import {
  getBaseImagePath,
  getFinalImagePath,
  toWorkspaceRelative,
} from "../../core/paths.ts";
import type { ResolvedOutput } from "../../shared/types.ts";

export function buildPanelOutputPaths(
  projectId: string,
  chapterId: string,
  panelId: string,
): ResolvedOutput {
  return {
    base_image_path: toWorkspaceRelative(getBaseImagePath(projectId, chapterId, panelId)),
    final_image_path: toWorkspaceRelative(getFinalImagePath(projectId, chapterId, panelId)),
  };
}
