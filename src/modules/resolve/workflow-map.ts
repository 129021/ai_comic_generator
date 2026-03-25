import path from "node:path";

import { getWorkspaceRoot, toWorkspaceRelative } from "../../core/paths.ts";
import { ValidationError } from "../../shared/errors.ts";

const workflowMap: Record<string, string> = {
  "bedroom-night": "workflows/comfyui/baselines/baseline-bedroom-night-v1.json",
  "bedroom-night-basic": "workflows/comfyui/baselines/baseline-bedroom-night-basic-v1.json",
  "photoreal-majicmix": "workflows/comfyui/baselines/baseline-photoreal-majicmix-v1.json",
  "photoreal-majicmix-lora": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-realpantyhose-v3.json",
  "photoreal-majicmix-lora-promptonly": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-v1.json",
  "photoreal-majicmix-lora-openpose": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-openpose-v1.json",
  "photoreal-majicmix-lora-realpantyhose": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-realpantyhose-v1.json",
  "photoreal-majicmix-lora-realpantyhose-v2": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-realpantyhose-v2.json",
  "photoreal-majicmix-lora-realpantyhose-v3": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-realpantyhose-v3.json",
  "photoreal-majicmix-lora-pantyhose": "workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-pantyhose-v1.json",
  "bedroom-night-sdxl": "workflows/comfyui/baselines/baseline-bedroom-night-sdxl-v1.json",
  "bedroom-night-pose": "workflows/comfyui/baselines/baseline-bedroom-night-pose-v1.json",
  "bedroom-night-web": "workflows/comfyui/baselines/baseline-bedroom-night-web-v1.json",
  "window-reflection": "workflows/comfyui/baselines/baseline-window-reflection-v1.json",
  "window-reflection-faceid": "workflows/comfyui/baselines/baseline-window-reflection-faceid-v1.json",
  "window-reflection-faceid-lite": "workflows/comfyui/baselines/baseline-window-reflection-faceid-lite-v1.json",
  "window-reflection-faceid-openpose": "workflows/comfyui/baselines/baseline-window-reflection-faceid-openpose-v1.json",
  "office-teacher-highres": "workflows/comfyui/baselines/baseline-office-teacher-highres-v1.json",
  "office-teacher-highres-v2": "workflows/comfyui/baselines/baseline-office-teacher-highres-v2.json",
  "office-teacher-highres-v3": "workflows/comfyui/baselines/baseline-office-teacher-highres-v3.json",
  "office-teacher-highres-v4": "workflows/comfyui/baselines/baseline-office-teacher-highres-v4.json",
  "office-teacher-v4-nohires": "workflows/comfyui/baselines/baseline-office-teacher-v4-nohires.json",
  "office-teacher-deliberate": "workflows/comfyui/baselines/baseline-office-teacher-deliberate-v1.json",
  "office-teacher-sdxl": "workflows/comfyui/baselines/baseline-office-teacher-sdxl-v1.json",
  "night-street": "workflows/comfyui/baselines/baseline-night-street-v1.json",
};

export function resolveWorkflowFile(workflowId: string): string {
  const relativePath = workflowMap[workflowId];
  if (!relativePath) {
    throw new ValidationError(`Unknown workflow_id "${workflowId}".`);
  }

  return toWorkspaceRelative(path.join(getWorkspaceRoot(), relativePath));
}
