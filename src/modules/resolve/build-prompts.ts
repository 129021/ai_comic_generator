import type { SourcePanel, SourceScript } from "../../shared/types.ts";

function compactParts(parts: string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function getConsistencyParts(
  script: SourceScript,
  panel: SourcePanel,
  key: "positive_prompt" | "negative_prompt",
): string[] {
  return panel.characters
    .map((characterRef) => script.character_consistency?.[characterRef]?.[key])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function buildPositivePrompt(script: SourceScript, panel: SourcePanel): string {
  const characterAnchors = panel.prompt_build.character_refs.map(
    (characterRef) => script.character_anchors[characterRef],
  );
  const sceneAnchor = script.scene_anchors[panel.prompt_build.scene_ref];
  const consistencyPositive = getConsistencyParts(script, panel, "positive_prompt");

  return compactParts([
    ...characterAnchors,
    sceneAnchor,
    ...consistencyPositive,
    panel.prompt_build.local_positive,
    script.style_profile.global_positive,
  ]);
}

export function buildNegativePrompt(script: SourceScript, panel: SourcePanel): string {
  const consistencyNegative = getConsistencyParts(script, panel, "negative_prompt");

  return compactParts([
    script.style_profile.global_negative,
    ...consistencyNegative,
    panel.prompt_build.local_negative,
  ]);
}
