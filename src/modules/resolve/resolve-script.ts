import path from "node:path";

import {
  getResolvedPath,
  getWorkspaceRoot,
  toWorkspaceRelative,
} from "../../core/paths.ts";
import { detectTextLang } from "../../shared/lang.ts";
import { readJsonFile, writeJsonFile } from "../../shared/json.ts";
import type {
  DialogueItem,
  OverridesFile,
  PanelState,
  ResolvedChapter,
  ResolvedPanel,
  SourcePanel,
  SourceScript,
} from "../../shared/types.ts";
import { buildPanelOutputPaths } from "./build-output-paths.ts";
import { resolveModelId } from "./model-map.ts";
import { buildNegativePrompt, buildPositivePrompt } from "./build-prompts.ts";
import { validateSourceScript } from "./validate-script.ts";
import { resolveWorkflowFile } from "./workflow-map.ts";

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
      continue;
    }

    result[key] = value;
  }

  return result as T;
}

function applyOverrides(script: SourceScript, overrides?: OverridesFile): SourceScript {
  if (!overrides?.panels) {
    return script;
  }

  return {
    ...script,
    panels: script.panels.map((panel) => {
      const panelOverride = overrides.panels?.[panel.panel_id];
      if (!panelOverride) {
        return panel;
      }

      return deepMerge(panel, panelOverride);
    }),
  };
}

function enrichDialogueLang(dialogue: DialogueItem[]): DialogueItem[] {
  return dialogue.map((item) => ({
    ...item,
    lang: item.lang ?? detectTextLang(item.text),
  }));
}

function buildInitialState(panel: SourcePanel): PanelState {
  return {
    status: panel.status === "failed" ? "failed" : "pending",
    retry_count: panel.retry_count ?? 0,
    approved: false,
    last_error: "",
    manual_notes: panel.manual_notes ?? "",
  };
}

function buildCharacterConsistencyTuning(
  script: SourceScript,
  panel: SourcePanel,
): Record<string, string | number | boolean> {
  const merged: Record<string, string | number | boolean> = {};

  for (const characterRef of panel.characters) {
    const profile = script.character_consistency?.[characterRef];
    if (!profile?.scene_tuning) {
      continue;
    }

    Object.assign(merged, profile.scene_tuning);
  }

  return merged;
}

function buildResolvedPanel(script: SourceScript, panel: SourcePanel): ResolvedPanel {
  const consistencySceneTuning = buildCharacterConsistencyTuning(script, panel);

  return {
    panel_id: panel.panel_id,
    sequence: panel.sequence,
    location_id: panel.location_id,
    scene_description: panel.scene_description,
    resolved_prompt: {
      positive: buildPositivePrompt(script, panel),
      negative: buildNegativePrompt(script, panel),
    },
    resolved_render: {
      workflow_id: panel.render_profile.workflow_id,
      workflow_file: resolveWorkflowFile(panel.render_profile.workflow_id),
      model_id: resolveModelId(panel.render_profile.model_id),
      core: panel.render_profile.core,
      scene_tuning: {
        ...consistencySceneTuning,
        ...panel.render_profile.scene_tuning,
      },
      notes: panel.render_profile.notes,
    },
    text_content: {
      dialogue: enrichDialogueLang(panel.dialogue),
      narration: panel.narration,
      bubble_plan: panel.bubble_plan,
    },
    output: buildPanelOutputPaths(script.project_id, script.chapter_id, panel.panel_id),
    state: buildInitialState(panel),
  };
}

export async function resolveChapter(
  sourceScriptPath: string,
  overridesPath?: string,
): Promise<{ resolvedPath: string; chapter: ResolvedChapter }> {
  const absoluteSourcePath = path.resolve(getWorkspaceRoot(), sourceScriptPath);
  const sourceScript = await readJsonFile<SourceScript>(absoluteSourcePath);
  const overrides = overridesPath
    ? await readJsonFile<OverridesFile>(path.resolve(getWorkspaceRoot(), overridesPath))
    : undefined;

  const mergedScript = applyOverrides(sourceScript, overrides);
  validateSourceScript(mergedScript);

  const chapter: ResolvedChapter = {
    project_id: mergedScript.project_id,
    chapter_id: mergedScript.chapter_id,
    chapter_title: mergedScript.chapter_title,
    source_script_path: toWorkspaceRelative(absoluteSourcePath),
    generated_at: new Date().toISOString(),
    render_defaults: {
      image_format: "png",
      device_scale_factor: 2,
    },
    panels: mergedScript.panels.map((panel) => buildResolvedPanel(mergedScript, panel)),
  };

  const resolvedPath = getResolvedPath(mergedScript.project_id, mergedScript.chapter_id);
  await writeJsonFile(resolvedPath, chapter);

  return {
    resolvedPath,
    chapter,
  };
}
