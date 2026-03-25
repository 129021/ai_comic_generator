import path from "node:path";

import { AppError } from "../shared/errors.ts";
import { typesetChapter } from "../modules/typeset/typeset-chapter.ts";

function parseArgs(argv: string[]): { resolvedChapterPath: string } {
  const [resolvedChapterPath] = argv;
  if (!resolvedChapterPath) {
    throw new AppError(
      "Usage: npm run typeset:chapter -- <resolved-chapter-path>",
    );
  }

  return { resolvedChapterPath };
}

async function main(): Promise<void> {
  const { resolvedChapterPath } = parseArgs(process.argv.slice(2));
  const results = await typesetChapter(resolvedChapterPath);

  const renderedPngCount = results.filter((item) => item.pngRendered).length;
  const missingBaseImageCount = results.filter((item) => !item.baseImageExists).length;
  console.log(`Typeset chapter complete. Panels: ${results.length}`);
  console.log(`HTML previews written for all panels.`);
  if (renderedPngCount === results.length) {
    console.log("PNG rendered for all panels.");
  } else {
    console.log(
      `PNG rendering skipped for ${results.length - renderedPngCount} panel(s): puppeteer is not installed yet.`,
    );
  }
  if (missingBaseImageCount > 0) {
    console.log(
      `Warning: ${missingBaseImageCount} panel(s) do not have base images yet, so their previews only show dialogue overlays.`,
    );
  }
  console.log(`Example HTML: ${path.relative(process.cwd(), results[0]?.htmlPath ?? "")}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
