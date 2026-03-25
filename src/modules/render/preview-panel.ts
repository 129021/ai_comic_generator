import { resolveWorkflowFile } from "../resolve/workflow-map.ts";
import type { ResolvedPanel } from "../../shared/types.ts";
import type { PreviewConfig } from "../../shared/preview.ts";

function roundToMultiple(value: number, multiple: number): number {
  return Math.max(multiple, Math.round(value / multiple) * multiple);
}

function clampPreviewSize(
  width: number,
  height: number,
  config: PreviewConfig,
): { width: number; height: number } {
  const scale = Math.min(1, config.maxWidth / width, config.maxHeight / height);
  if (scale >= 1) {
    return { width, height };
  }

  const nextWidth = roundToMultiple(width * scale, 64);
  const nextHeight = roundToMultiple(height * scale, 64);

  return {
    width: Math.min(config.maxWidth, nextWidth),
    height: Math.min(config.maxHeight, nextHeight),
  };
}

function resolvePreviewWorkflow(panel: ResolvedPanel): {
  workflowId: string;
  workflowFile: string;
} {
  const { workflow_id: workflowId, model_id: modelId } = panel.resolved_render;
  const isSdxl = modelId === "sd_xl_base_1.0.safetensors";

  if (!isSdxl && workflowId.startsWith("bedroom-night") && workflowId !== "bedroom-night-basic") {
    return {
      workflowId: "bedroom-night-basic",
      workflowFile: resolveWorkflowFile("bedroom-night-basic"),
    };
  }

  return {
    workflowId,
    workflowFile: panel.resolved_render.workflow_file,
  };
}

export function buildPreviewPanel(
  panel: ResolvedPanel,
  config: PreviewConfig,
): ResolvedPanel {
  const { width, height } = clampPreviewSize(
    panel.resolved_render.core.width,
    panel.resolved_render.core.height,
    config,
  );
  const previewWorkflow = resolvePreviewWorkflow(panel);

  return {
    ...panel,
    resolved_render: {
      ...panel.resolved_render,
      workflow_id: previewWorkflow.workflowId,
      workflow_file: previewWorkflow.workflowFile,
      core: {
        ...panel.resolved_render.core,
        width,
        height,
        steps: Math.min(panel.resolved_render.core.steps, config.maxSteps),
      },
      // Preview renders favor speed and composition checks over identity locking.
      scene_tuning: {},
      notes: `${panel.resolved_render.notes} [preview mode]`.trim(),
    },
  };
}
