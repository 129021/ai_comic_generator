import { readFile, writeFile } from "node:fs/promises";

import { ensureParentDir } from "./fs.ts";

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureParentDir(filePath);
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(filePath, content, "utf8");
}
