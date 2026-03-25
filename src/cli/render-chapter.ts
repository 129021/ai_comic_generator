import path from "node:path";

import { renderChapter } from "../modules/render/render-chapter.ts";
import { AppError } from "../shared/errors.ts";

function parseArgs(argv: string[]): { resolvedChapterPath: string } {
  const [resolvedChapterPath] = argv;
  if (!resolvedChapterPath) {
    throw new AppError(
      "Usage: npm run render:chapter -- <resolved-chapter-path>",
    );
  }

  return { resolvedChapterPath };
}

async function main(): Promise<void> {
  const { resolvedChapterPath } = parseArgs(process.argv.slice(2));
  const results = await renderChapter(resolvedChapterPath);

  console.log(`Rendered chapter base images. Panels: ${results.length}`);
  console.log(`Example output: ${path.relative(process.cwd(), results[0]?.outputPath ?? "")}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
