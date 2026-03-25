import type { SourcePanel, SourceScript } from "../../shared/types.ts";

function compactParts(parts: string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function buildPositivePrompt(script: SourceScript, panel: SourcePanel): string {
  const characterAnchors = panel.prompt_build.character_refs.map(
    (characterRef) => script.character_anchors[characterRef],
  );
  const sceneAnchor = script.scene_anchors[panel.prompt_build.scene_ref];

  return compactParts([
    ...characterAnchors,
    sceneAnchor,
    panel.prompt_build.local_positive,
    script.style_profile.global_positive,
  ]);
}

export function buildNegativePrompt(script: SourceScript, panel: SourcePanel): string {
  return compactParts([script.style_profile.global_negative, panel.prompt_build.local_negative]);
}
