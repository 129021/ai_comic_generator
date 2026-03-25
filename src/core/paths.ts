import path from "node:path";

export function getWorkspaceRoot(): string {
  return process.cwd();
}

export function toWorkspaceRelative(absolutePath: string): string {
  return path.relative(getWorkspaceRoot(), absolutePath);
}

export function getProjectStateDir(projectId: string): string {
  return path.join(getWorkspaceRoot(), "state", projectId);
}

export function getResolvedPath(projectId: string, chapterId: string): string {
  return path.join(getProjectStateDir(projectId), `${chapterId}.resolved.json`);
}

export function getRenderStatePath(projectId: string, chapterId: string): string {
  return path.join(getProjectStateDir(projectId), `${chapterId}.render-state.json`);
}

export function getRenderStatePathForVariant(
  projectId: string,
  chapterId: string,
  suffix?: string,
): string {
  const basePath = getRenderStatePath(projectId, chapterId);
  if (!suffix) {
    return basePath;
  }

  const extension = path.extname(basePath);
  const stem = basePath.slice(0, -extension.length);
  return `${stem}.${suffix}${extension}`;
}

export function getBaseImagePath(projectId: string, chapterId: string, panelId: string): string {
  return path.join(getWorkspaceRoot(), "output", "base_images", projectId, chapterId, `${panelId}.png`);
}

export function getFinalImagePath(projectId: string, chapterId: string, panelId: string): string {
  return path.join(getWorkspaceRoot(), "output", "final_comic", projectId, chapterId, `${panelId}.png`);
}
