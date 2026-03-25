import path from "node:path";

function isEnabledValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export interface PreviewConfig {
  enabled: boolean;
  fileSuffix: string;
  maxWidth: number;
  maxHeight: number;
  maxSteps: number;
}

export function getPreviewConfig(): PreviewConfig {
  return {
    enabled: isEnabledValue(process.env.FAST_PREVIEW),
    fileSuffix: process.env.FAST_PREVIEW_SUFFIX?.trim() || "preview",
    maxWidth: parsePositiveInt(process.env.FAST_PREVIEW_MAX_WIDTH, 640),
    maxHeight: parsePositiveInt(process.env.FAST_PREVIEW_MAX_HEIGHT, 960),
    maxSteps: parsePositiveInt(process.env.FAST_PREVIEW_MAX_STEPS, 16),
  };
}

export function appendFileSuffix(filePath: string, suffix: string): string {
  const extension = path.extname(filePath);
  const stem = extension ? filePath.slice(0, -extension.length) : filePath;
  return `${stem}.${suffix}${extension}`;
}
