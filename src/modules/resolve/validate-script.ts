import { ValidationError } from "../../shared/errors.ts";
import type { SourcePanel, SourceScript } from "../../shared/types.ts";

function assertString(value: unknown, message: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(message);
  }
}

function assertArray(value: unknown, message: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(message);
  }
}

export function validatePanel(panel: SourcePanel, script: SourceScript): void {
  assertString(panel.panel_id, "Each panel must have a non-empty panel_id.");
  assertString(panel.location_id, `Panel ${panel.panel_id} must have location_id.`);
  assertString(panel.scene_description, `Panel ${panel.panel_id} must have scene_description.`);

  assertArray(panel.characters, `Panel ${panel.panel_id} characters must be an array.`);
  assertArray(panel.dialogue, `Panel ${panel.panel_id} dialogue must be an array.`);
  assertArray(panel.narration, `Panel ${panel.panel_id} narration must be an array.`);
  assertArray(panel.bubble_plan, `Panel ${panel.panel_id} bubble_plan must be an array.`);

  if (!panel.prompt_build) {
    throw new ValidationError(`Panel ${panel.panel_id} must have prompt_build.`);
  }

  assertString(panel.prompt_build.scene_ref, `Panel ${panel.panel_id} must have prompt_build.scene_ref.`);

  if (!script.scene_anchors[panel.prompt_build.scene_ref]) {
    throw new ValidationError(
      `Panel ${panel.panel_id} references unknown scene anchor "${panel.prompt_build.scene_ref}".`,
    );
  }

  for (const characterRef of panel.prompt_build.character_refs) {
    if (!script.character_anchors[characterRef]) {
      throw new ValidationError(
        `Panel ${panel.panel_id} references unknown character anchor "${characterRef}".`,
      );
    }
  }

  if (!panel.render_profile) {
    throw new ValidationError(`Panel ${panel.panel_id} must have render_profile.`);
  }

  assertString(panel.render_profile.workflow_id, `Panel ${panel.panel_id} must have render_profile.workflow_id.`);
  assertString(panel.render_profile.model_id, `Panel ${panel.panel_id} must have render_profile.model_id.`);
}

export function validateSourceScript(script: SourceScript): void {
  assertString(script.project_id, "Source script must have project_id.");
  assertString(script.chapter_id, "Source script must have chapter_id.");
  assertString(script.chapter_title, "Source script must have chapter_title.");

  if (!script.style_profile?.global_positive || !script.style_profile?.global_negative) {
    throw new ValidationError("Source script must have style_profile.global_positive and global_negative.");
  }

  for (const characterRef of Object.keys(script.character_consistency ?? {})) {
    if (!script.character_anchors[characterRef]) {
      throw new ValidationError(
        `character_consistency references unknown character "${characterRef}".`,
      );
    }
  }

  assertArray(script.panels, "Source script must have panels array.");

  const seen = new Set<string>();
  for (const panel of script.panels) {
    if (seen.has(panel.panel_id)) {
      throw new ValidationError(`Duplicate panel_id found: ${panel.panel_id}`);
    }
    seen.add(panel.panel_id);
    validatePanel(panel, script);
  }
}
