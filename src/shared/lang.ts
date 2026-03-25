import type { LangCode } from "./types.ts";

const chineseRegex = /[\u3400-\u9fff]/u;
const englishRegex = /[A-Za-z]/u;

export function isMostlyChinese(text: string): boolean {
  const chineseCount = Array.from(text).filter((char) => chineseRegex.test(char)).length;
  const englishCount = Array.from(text).filter((char) => englishRegex.test(char)).length;
  return chineseCount > englishCount;
}

export function isMostlyEnglish(text: string): boolean {
  const chineseCount = Array.from(text).filter((char) => chineseRegex.test(char)).length;
  const englishCount = Array.from(text).filter((char) => englishRegex.test(char)).length;
  return englishCount >= chineseCount;
}

export function detectTextLang(text: string): LangCode {
  return isMostlyChinese(text) ? "zh" : "en";
}
