export type LangCode = "zh" | "en";

export type DialogueType = "normal" | "phone_voice" | "narration" | "thought";

export type PanelStatus =
  | "pending"
  | "rendered"
  | "approved"
  | "typeset_done"
  | "failed";

export interface StyleProfile {
  global_positive: string;
  global_negative: string;
}

export interface PromptBuild {
  character_refs: string[];
  scene_ref: string;
  local_positive: string;
  local_negative: string;
}

export interface RenderCoreSettings {
  seed: number;
  width: number;
  height: number;
  steps: number;
  cfg: number;
  sampler_name: string;
  scheduler: string;
}

export type RenderTuningValue = string | number | boolean;

export interface RenderProfile {
  workflow_id: string;
  model_id: string;
  core: RenderCoreSettings;
  scene_tuning: Record<string, RenderTuningValue>;
  notes: string;
}

export interface DialogueItem {
  speaker: string;
  text: string;
  type: DialogueType;
  lang?: LangCode;
}

export interface BubblePlanItem {
  type: DialogueType;
  text: string;
  anchor_zone: string;
}

export interface SourcePanel {
  panel_id: string;
  sequence: number;
  location_id: string;
  characters: string[];
  render_profile: RenderProfile;
  scene_description: string;
  prompt_build: PromptBuild;
  dialogue: DialogueItem[];
  narration: string[];
  bubble_plan: BubblePlanItem[];
  status: string;
  retry_count: number;
  manual_notes: string;
}

export interface SourceScript {
  project_id: string;
  chapter_id: string;
  chapter_title: string;
  style_profile: StyleProfile;
  character_anchors: Record<string, string>;
  scene_anchors: Record<string, string>;
  panels: SourcePanel[];
}

export interface ResolvedPrompt {
  positive: string;
  negative: string;
}

export interface ResolvedRender {
  workflow_id: string;
  workflow_file: string;
  model_id: string;
  core: RenderCoreSettings;
  scene_tuning: Record<string, RenderTuningValue>;
  notes: string;
}

export interface ResolvedTextContent {
  dialogue: DialogueItem[];
  narration: string[];
  bubble_plan: BubblePlanItem[];
}

export interface ResolvedOutput {
  base_image_path: string;
  final_image_path: string;
}

export interface PanelState {
  status: PanelStatus;
  retry_count: number;
  approved: boolean;
  last_error: string;
  manual_notes: string;
}

export interface RenderStatePanelRecord {
  panel_id: string;
  status: PanelStatus;
  output_path: string;
  workflow_id: string;
  workflow_file: string;
  renderer: string;
  updated_at: string;
  last_error: string;
}

export interface RenderStateFile {
  project_id: string;
  chapter_id: string;
  updated_at: string;
  panels: RenderStatePanelRecord[];
}

export interface ResolvedPanel {
  panel_id: string;
  sequence: number;
  location_id: string;
  scene_description: string;
  resolved_prompt: ResolvedPrompt;
  resolved_render: ResolvedRender;
  text_content: ResolvedTextContent;
  output: ResolvedOutput;
  state: PanelState;
}

export interface ResolvedChapter {
  project_id: string;
  chapter_id: string;
  chapter_title: string;
  source_script_path: string;
  generated_at: string;
  render_defaults: {
    image_format: "png";
    device_scale_factor: number;
  };
  panels: ResolvedPanel[];
}

export interface OverridesFile {
  panels?: Record<string, Partial<SourcePanel>>;
}
