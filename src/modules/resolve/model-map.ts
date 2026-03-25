const MODEL_ID_MAP: Record<string, string> = {
  "deliberate-v2": "Deliberate_v2.safetensors",
  "majicmix-realistic-v7": "majicMIX realistic 麦橘写实_v7.safetensors",
  "sdxl-base-1.0": "sd_xl_base_1.0.safetensors",
};

export function resolveModelId(modelId: string): string {
  return MODEL_ID_MAP[modelId] ?? modelId;
}
