import path from "node:path";

import { AppError } from "../shared/errors.ts";
import { typesetPanel } from "../modules/typeset/typeset-panel.ts";

function parseArgs(argv: string[]): { resolvedChapterPath: string; panelId: string } {
  const [resolvedChapterPath, panelId] = argv;
  if (!resolvedChapterPath || !panelId) {
    throw new AppError(
      "Usage: npm run typeset:panel -- <resolved-chapter-path> <panel-id>",
    );
  }

  return { resolvedChapterPath, panelId };
}

async function main(): Promise<void> {
  const { resolvedChapterPath, panelId } = parseArgs(process.argv.slice(2));
  const result = await typesetPanel(resolvedChapterPath, panelId);

  console.log(`Typeset preview generated for ${panelId}`);
  console.log(`HTML: ${path.relative(process.cwd(), result.htmlPath)}`);
  if (result.pngRendered) {
    console.log(`PNG: ${path.relative(process.cwd(), result.pngPath)}`);
  } else {
    console.log("PNG rendering skipped: puppeteer is not installed yet.");
  }
  if (!result.baseImageExists) {
    console.log("Warning: base image file does not exist yet, so the PNG preview contains bubbles without the rendered artwork.");
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
