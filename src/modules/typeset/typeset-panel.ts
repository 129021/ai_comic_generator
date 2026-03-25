import { access, writeFile } from "node:fs/promises";
import path from "node:path";

import { readJsonFile } from "../../shared/json.ts";
import { ensureParentDir } from "../../shared/fs.ts";
import { appendFileSuffix, getPreviewConfig } from "../../shared/preview.ts";
import type { ResolvedChapter } from "../../shared/types.ts";
import { buildPanelHtml } from "./build-html.ts";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function maybeRenderWithPuppeteer(htmlPath: string, pngPath: string): Promise<boolean> {
  try {
    const puppeteerModule = await import("puppeteer");
    const browser = await puppeteerModule.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1024, height: 1536, deviceScaleFactor: 2 });
      await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
      await page.screenshot({ path: pngPath, type: "png" });
    } finally {
      await browser.close();
    }
    return true;
  } catch {
    return false;
  }
}

export async function typesetPanel(
  resolvedChapterPath: string,
  panelId: string,
): Promise<{
  htmlPath: string;
  pngPath: string;
  pngRendered: boolean;
  baseImageExists: boolean;
}> {
  const absoluteResolvedPath = path.resolve(process.cwd(), resolvedChapterPath);
  const chapter = await readJsonFile<ResolvedChapter>(absoluteResolvedPath);
  const sourcePanel = chapter.panels.find((item) => item.panel_id === panelId);

  if (!sourcePanel) {
    throw new Error(`Panel "${panelId}" not found in ${resolvedChapterPath}.`);
  }

  const previewConfig = getPreviewConfig();
  const panel = previewConfig.enabled
    ? {
        ...sourcePanel,
        output: {
          base_image_path: appendFileSuffix(
            sourcePanel.output.base_image_path,
            previewConfig.fileSuffix,
          ),
          final_image_path: appendFileSuffix(
            sourcePanel.output.final_image_path,
            previewConfig.fileSuffix,
          ),
        },
      }
    : sourcePanel;

  const htmlPath = path.join(process.cwd(), panel.output.final_image_path.replace(/\.png$/u, ".html"));
  const pngPath = path.join(process.cwd(), panel.output.final_image_path);
  const baseImagePath = path.join(process.cwd(), panel.output.base_image_path);
  const baseImageExists = await fileExists(baseImagePath);
  const html = await buildPanelHtml(panel);

  await ensureParentDir(htmlPath);
  await writeFile(htmlPath, html, "utf8");

  const pngRendered = await maybeRenderWithPuppeteer(htmlPath, pngPath);
  return { htmlPath, pngPath, pngRendered, baseImageExists };
}
