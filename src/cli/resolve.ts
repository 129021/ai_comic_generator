import path from "node:path";

import { resolveChapter } from "../modules/resolve/resolve-script.ts";
import { AppError } from "../shared/errors.ts";

function parseArgs(argv: string[]): { sourceScriptPath: string; overridesPath?: string } {
  const [sourceScriptPath, ...rest] = argv;
  if (!sourceScriptPath) {
    throw new AppError(
      "Usage: npm run script:resolve -- <source-script-path> [--overrides <overrides-path>]",
    );
  }

  let overridesPath: string | undefined;

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === "--overrides") {
      overridesPath = rest[index + 1];
      index += 1;
    }
  }

  return { sourceScriptPath, overridesPath };
}

async function main(): Promise<void> {
  const { sourceScriptPath, overridesPath } = parseArgs(process.argv.slice(2));
  const { resolvedPath, chapter } = await resolveChapter(sourceScriptPath, overridesPath);

  console.log(`Resolved ${chapter.project_id}/${chapter.chapter_id}`);
  console.log(`Panels: ${chapter.panels.length}`);
  console.log(`Output: ${path.relative(process.cwd(), resolvedPath)}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
