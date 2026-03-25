import path from "node:path";

import { renderPanel } from "../modules/render/render-panel.ts";
import { AppError } from "../shared/errors.ts";

function parseArgs(argv: string[]): { resolvedChapterPath: string; panelId: string } {
  const [resolvedChapterPath, panelId] = argv;
  if (!resolvedChapterPath || !panelId) {
    throw new AppError(
      "Usage: npm run render:panel -- <resolved-chapter-path> <panel-id>",
    );
  }

  return { resolvedChapterPath, panelId };
}

async function main(): Promise<void> {
  const { resolvedChapterPath, panelId } = parseArgs(process.argv.slice(2));
  const result = await renderPanel(resolvedChapterPath, panelId);

  console.log(`Rendered base image for ${panelId}`);
  console.log(`Renderer: ${result.renderer}`);
  console.log(`Output: ${path.relative(process.cwd(), result.outputPath)}`);
  console.log(`Render state: ${path.relative(process.cwd(), result.renderStatePath)}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
