import type { LangCode } from "../../shared/types.ts";

export interface FontConfig {
  fontFamily: string;
  fontSizePx: number;
  lineHeight: number;
}

const zhConfig: FontConfig = {
  fontFamily:
    '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  fontSizePx: 34,
  lineHeight: 1.45,
};

const enConfig: FontConfig = {
  fontFamily:
    '"Inter", "Helvetica Neue", "Arial", "Noto Sans", sans-serif',
  fontSizePx: 32,
  lineHeight: 1.4,
};

export function getFontConfig(lang: LangCode): FontConfig {
  return lang === "zh" ? zhConfig : enConfig;
}
