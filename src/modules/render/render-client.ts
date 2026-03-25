import { copyFile, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import puppeteer from "puppeteer";

import { ensureParentDir } from "../../shared/fs.ts";
import type { ResolvedPanel } from "../../shared/types.ts";
import { logWarn } from "../../shared/logger.ts";

export interface RenderPanelResult {
  outputPath: string;
  renderer: string;
}

interface WorkflowBinding {
  node_id: string;
  input_name: string;
}

interface ComfyWorkflowTemplate {
  template_format: "comfyui-api-workflow-v1";
  description?: string;
  api_workflow: Record<string, { inputs?: Record<string, unknown> }>;
  bindings: {
    positive_prompt: WorkflowBinding;
    negative_prompt: WorkflowBinding;
    seed: WorkflowBinding;
    steps: WorkflowBinding;
    cfg: WorkflowBinding;
    sampler_name: WorkflowBinding;
    scheduler: WorkflowBinding;
    width: WorkflowBinding;
    height: WorkflowBinding;
    model_id?: WorkflowBinding;
    output_prefix?: WorkflowBinding;
    scene_tuning?: Record<string, WorkflowBinding>;
  };
  result_node_id?: string;
}

type RenderBackend = "auto" | "stub" | "comfyui";

function getRenderBackend(): RenderBackend {
  const value = process.env.RENDER_BACKEND?.trim().toLowerCase();
  if (value === "stub" || value === "comfyui") {
    return value;
  }

  return "auto";
}

function getComfyBaseUrl(): string {
  return process.env.COMFYUI_BASE_URL?.trim() || "http://127.0.0.1:8188";
}

function getComfyOutputDir(): string {
  const configured = process.env.COMFYUI_OUTPUT_DIR?.trim();
  if (configured) {
    return configured;
  }

  return path.join(process.cwd(), "ComfyUI/output");
}

function getComfyInputDir(): string {
  const configured = process.env.COMFYUI_INPUT_DIR?.trim();
  if (configured) {
    return configured;
  }

  return path.join(process.cwd(), "ComfyUI/input");
}

async function loadWorkflowTemplate(workflowFile: string): Promise<ComfyWorkflowTemplate | null> {
  const absolutePath = path.resolve(process.cwd(), workflowFile);
  try {
    const raw = await readFile(absolutePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ComfyWorkflowTemplate>;
    if (parsed.template_format !== "comfyui-api-workflow-v1") {
      return null;
    }

    return parsed as ComfyWorkflowTemplate;
  } catch {
    return null;
  }
}

function cloneWorkflowTemplate(
  workflow: ComfyWorkflowTemplate["api_workflow"],
): ComfyWorkflowTemplate["api_workflow"] {
  return JSON.parse(JSON.stringify(workflow)) as ComfyWorkflowTemplate["api_workflow"];
}

function applyBinding(
  workflow: ComfyWorkflowTemplate["api_workflow"],
  binding: WorkflowBinding | undefined,
  value: unknown,
): void {
  if (!binding) {
    return;
  }

  const node = workflow[binding.node_id];
  if (!node?.inputs) {
    throw new Error(`Workflow binding target node "${binding.node_id}" is missing.`);
  }

  node.inputs[binding.input_name] = value;
}

async function stageComfyInputAsset(
  sourcePath: string,
  outputPrefix: string,
): Promise<string> {
  const absoluteSourcePath = path.resolve(process.cwd(), sourcePath);
  const inputDir = getComfyInputDir();
  const stagedName = `${outputPrefix}-${path.basename(absoluteSourcePath)}`;
  const stagedPath = path.join(inputDir, stagedName);

  await ensureParentDir(stagedPath);
  await copyFile(absoluteSourcePath, stagedPath);

  return stagedName;
}

async function buildPromptPayload(
  panel: ResolvedPanel,
  template: ComfyWorkflowTemplate,
  outputPath: string,
): Promise<Record<string, { inputs?: Record<string, unknown> }>> {
  const workflow = cloneWorkflowTemplate(template.api_workflow);
  const bindings = template.bindings;
  const prefix = path.basename(outputPath, path.extname(outputPath));

  applyBinding(workflow, bindings.positive_prompt, panel.resolved_prompt.positive);
  applyBinding(workflow, bindings.negative_prompt, panel.resolved_prompt.negative);
  applyBinding(workflow, bindings.seed, panel.resolved_render.core.seed);
  applyBinding(workflow, bindings.steps, panel.resolved_render.core.steps);
  applyBinding(workflow, bindings.cfg, panel.resolved_render.core.cfg);
  applyBinding(workflow, bindings.sampler_name, panel.resolved_render.core.sampler_name);
  applyBinding(workflow, bindings.scheduler, panel.resolved_render.core.scheduler);
  applyBinding(workflow, bindings.width, panel.resolved_render.core.width);
  applyBinding(workflow, bindings.height, panel.resolved_render.core.height);
  applyBinding(workflow, bindings.model_id, panel.resolved_render.model_id);
  applyBinding(workflow, bindings.output_prefix, prefix);

  for (const [key, value] of Object.entries(panel.resolved_render.scene_tuning)) {
    if (key.endsWith("_path") && typeof value === "string") {
      const stagedFileName = await stageComfyInputAsset(value, prefix);
      applyBinding(workflow, bindings.scene_tuning?.[key], stagedFileName);
      continue;
    }

    applyBinding(workflow, bindings.scene_tuning?.[key], value);
  }

  return workflow;
}

async function assertComfyAvailable(baseUrl: string): Promise<void> {
  const response = await fetch(`${baseUrl}/system_stats`);
  if (!response.ok) {
    throw new Error(`ComfyUI health check failed with status ${response.status}.`);
  }
}

async function queuePrompt(
  baseUrl: string,
  prompt: Record<string, { inputs?: Record<string, unknown> }>,
): Promise<string> {
  const response = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to queue ComfyUI prompt: ${response.status} ${body}`);
  }

  const json = (await response.json()) as { prompt_id?: string };
  if (!json.prompt_id) {
    throw new Error("ComfyUI response did not include prompt_id.");
  }

  return json.prompt_id;
}

async function waitForHistory(
  baseUrl: string,
  promptId: string,
): Promise<Record<string, unknown>> {
  const maxAttempts = 600;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`${baseUrl}/history/${promptId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ComfyUI history for prompt ${promptId}.`);
    }

    const history = (await response.json()) as Record<string, unknown>;
    const entry = history[promptId];
    if (entry) {
      const typedEntry = entry as Record<string, unknown>;
      const status = typedEntry.status as {
        completed?: boolean;
        status_str?: string;
        messages?: Array<[string, Record<string, unknown>]>;
      } | undefined;
      if (status?.completed) {
        return typedEntry;
      }

      if (status?.status_str === "error") {
        const messagePayloads = Array.isArray(status.messages) ? status.messages : [];
        const errorPayload = messagePayloads
          .map(([, payload]) => payload)
          .find((payload) => typeof payload?.exception_message === "string");
        const exceptionMessage =
          typeof errorPayload?.exception_message === "string"
            ? errorPayload.exception_message.trim()
            : "Unknown ComfyUI execution error.";

        throw new Error(`ComfyUI prompt ${promptId} failed: ${exceptionMessage}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ComfyUI history for prompt ${promptId}.`);
}

function extractFirstImageRef(
  historyEntry: Record<string, unknown>,
  resultNodeId?: string,
): { filename: string; subfolder?: string; type?: string } {
  const outputs = historyEntry.outputs as Record<string, { images?: Array<{ filename: string; subfolder?: string; type?: string }> }> | undefined;
  if (!outputs) {
    throw new Error("ComfyUI history did not include outputs.");
  }

  const nodeIds = resultNodeId ? [resultNodeId] : Object.keys(outputs);
  for (const nodeId of nodeIds) {
    const images = outputs[nodeId]?.images;
    if (images?.length) {
      return images[0];
    }
  }

  throw new Error("ComfyUI history did not include any output images.");
}

async function findLatestComfyOutputByPrefix(prefix: string): Promise<string | null> {
  const outputDir = getComfyOutputDir();

  let files: string[];
  try {
    files = await readdir(outputDir);
  } catch {
    return null;
  }

  const matches = await Promise.all(
    files
      .filter((file) => file.startsWith(`${prefix}_`) && file.toLowerCase().endsWith(".png"))
      .map(async (file) => {
        const absolutePath = path.join(outputDir, file);
        const stats = await stat(absolutePath);
        return {
          absolutePath,
          modifiedMs: stats.mtimeMs,
        };
      }),
  );

  if (!matches.length) {
    return null;
  }

  matches.sort((a, b) => b.modifiedMs - a.modifiedMs);
  return matches[0].absolutePath;
}

async function downloadImageFromComfy(
  baseUrl: string,
  imageRef: { filename: string; subfolder?: string; type?: string },
  outputPath: string,
): Promise<void> {
  const params = new URLSearchParams({
    filename: imageRef.filename,
    type: imageRef.type ?? "output",
  });

  if (imageRef.subfolder) {
    params.set("subfolder", imageRef.subfolder);
  }

  const response = await fetch(`${baseUrl}/view?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to download ComfyUI image: ${response.status}`);
  }

  await ensureParentDir(outputPath);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(outputPath, bytes);
}

async function renderPanelWithComfy(
  panel: ResolvedPanel,
  outputPath: string,
): Promise<RenderPanelResult> {
  const baseUrl = getComfyBaseUrl();
  const template = await loadWorkflowTemplate(panel.resolved_render.workflow_file);

  if (!template) {
    throw new Error(
      `Workflow file ${panel.resolved_render.workflow_file} is not a valid comfyui-api-workflow-v1 template.`,
    );
  }

  if (!Object.keys(template.api_workflow ?? {}).length) {
    throw new Error(`Workflow template ${panel.resolved_render.workflow_file} does not contain api_workflow yet.`);
  }

  await assertComfyAvailable(baseUrl);
  const prompt = await buildPromptPayload(panel, template, outputPath);
  const promptId = await queuePrompt(baseUrl, prompt);
  const historyEntry = await waitForHistory(baseUrl, promptId);
  const prefix = path.basename(outputPath, path.extname(outputPath));

  try {
    const imageRef = extractFirstImageRef(historyEntry, template.result_node_id);
    await downloadImageFromComfy(baseUrl, imageRef, outputPath);
  } catch (error) {
    const fallbackPath = await findLatestComfyOutputByPrefix(prefix);
    if (!fallbackPath) {
      throw error;
    }

    await ensureParentDir(outputPath);
    await copyFile(fallbackPath, outputPath);
  }

  return {
    outputPath,
    renderer: "comfyui",
  };
}

function getGradientForWorkflow(workflowId: string): string {
  switch (workflowId) {
    case "bedroom-night":
      return "linear-gradient(180deg, #2d1f2f 0%, #11141d 100%)";
    case "window-reflection":
      return "linear-gradient(180deg, #1a2533 0%, #0e1319 100%)";
    case "night-street":
      return "linear-gradient(180deg, #16304b 0%, #11151d 100%)";
    default:
      return "linear-gradient(180deg, #1b1f27 0%, #0f1115 100%)";
  }
}

function buildStubHtml(panel: ResolvedPanel): string {
  const gradient = getGradientForWorkflow(panel.resolved_render.workflow_id);
  const sceneTuning = Object.entries(panel.resolved_render.scene_tuning)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        margin: 0;
        background: #0f1115;
        font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
      }

      .frame {
        position: relative;
        width: ${panel.resolved_render.core.width}px;
        height: ${panel.resolved_render.core.height}px;
        overflow: hidden;
        background: ${gradient};
        color: #f4f7fb;
      }

      .noise {
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 18%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05), transparent 22%),
          radial-gradient(circle at 30% 80%, rgba(255,255,255,0.05), transparent 20%);
        opacity: 0.75;
      }

      .meta {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px;
        box-sizing: border-box;
      }

      .eyebrow {
        font-size: 22px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.72;
      }

      .title {
        max-width: 76%;
        font-size: 54px;
        line-height: 1.12;
        font-weight: 600;
        margin-top: 16px;
      }

      .details {
        max-width: 72%;
        font-size: 28px;
        line-height: 1.5;
        opacity: 0.88;
      }

      .footer {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 78%;
      }

      .tag {
        display: inline-block;
        width: fit-content;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.14);
        font-size: 18px;
        letter-spacing: 0.04em;
      }

      .small {
        font-size: 18px;
        line-height: 1.45;
        opacity: 0.74;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="noise"></div>
      <div class="meta">
        <div>
          <div class="eyebrow">${panel.panel_id} • ${panel.resolved_render.workflow_id}</div>
          <div class="title">${panel.scene_description}</div>
        </div>
        <div class="details">
          ${panel.resolved_render.notes || "Stub render preview for layout verification."}
        </div>
        <div class="footer">
          <div class="tag">model: ${panel.resolved_render.model_id}</div>
          <div class="small">
            steps ${panel.resolved_render.core.steps} • cfg ${panel.resolved_render.core.cfg} • seed ${panel.resolved_render.core.seed}
          </div>
          <div class="small">
            ${sceneTuning || "scene_tuning: none"}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export async function renderPanelWithStub(
  panel: ResolvedPanel,
  outputPath: string,
): Promise<RenderPanelResult> {
  await ensureParentDir(outputPath);
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: panel.resolved_render.core.width,
      height: panel.resolved_render.core.height,
      deviceScaleFactor: 1,
    });
    await page.setContent(buildStubHtml(panel), { waitUntil: "load" });
    await page.screenshot({ path: outputPath, type: "png" });
  } finally {
    await browser.close();
  }

  return {
    outputPath,
    renderer: "stub",
  };
}

export async function renderPanelImage(
  panel: ResolvedPanel,
  outputPath: string,
): Promise<RenderPanelResult> {
  const backend = getRenderBackend();

  if (backend !== "stub") {
    try {
      return await renderPanelWithComfy(panel, outputPath);
    } catch (error) {
      if (backend === "comfyui") {
        throw error;
      }

      const message = error instanceof Error ? error.message : "Unknown ComfyUI render error";
      logWarn(`ComfyUI unavailable for ${panel.panel_id}, falling back to stub renderer. Reason: ${message}`);
    }
  }

  return renderPanelWithStub(panel, outputPath);
}
