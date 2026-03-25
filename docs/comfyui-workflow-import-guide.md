# ComfyUI Workflow Import Guide

## Purpose

This guide explains how to take a manually tuned ComfyUI workflow and connect it to the current V1 render pipeline.

The immediate target is:

- replace one stub render route with one real ComfyUI render route

Recommended first target:

- `baseline-bedroom-night-v1.json`

Do not start with the reflection workflow first.
Start with the easiest scene type.

## Recommended First Workflow

Use the bedroom workflow first because it is the lowest-risk scene class.

Recommended baseline target:

- `workflows/comfyui/baselines/baseline-bedroom-night-v1.json`

Recommended first validation panel:

- `p01`

Recommended second validation panel:

- `p04`

These are enough to prove the first real render path.

## Before You Export

In ComfyUI, first tune a workflow manually until it is acceptable for the bedroom-night scene.

The workflow should at minimum contain nodes equivalent to:

- checkpoint loader
- positive text encode
- negative text encode
- latent image
- sampler
- VAE decode
- save image

Do not try to build the perfect workflow at this point.
Build the first usable workflow.

## Export Format You Must Use

Inside ComfyUI, use the API export path.

The pipeline expects an API-style workflow, not only the normal UI graph format.

Target output:

- a JSON object where each node is keyed by node id
- each node has `class_type`
- each node has `inputs`

This is the same workflow shape used by the ComfyUI API examples.

## Integration Strategy

The baseline file in this repo is a wrapper format.

It has these main parts:

- `template_format`
- `description`
- `api_workflow`
- `bindings`
- `result_node_id`

Your job is:

1. export the real API workflow from ComfyUI
2. paste it into the `api_workflow` field
3. update the `bindings` section so the node ids match your exported workflow

## What To Edit In The Baseline File

Open:

- `/Volumes/T7/workspace/ai_comic_generator/workflows/comfyui/baselines/baseline-bedroom-night-v1.json`

Then replace:

- `"api_workflow": {}`

with the actual exported workflow object.

After that, inspect the node ids in your exported workflow and update the bindings.

## Required Binding Targets

The current render adapter expects these bindings to be valid:

- `positive_prompt`
- `negative_prompt`
- `seed`
- `steps`
- `cfg`
- `sampler_name`
- `scheduler`
- `width`
- `height`
- `model_id`
- `output_prefix`

The bedroom workflow currently does not require scene-specific tuning bindings.

## Example Binding Meaning

Example:

```json
"positive_prompt": { "node_id": "6", "input_name": "text" }
```

Meaning:

- find node `6`
- write the final positive prompt into its `inputs.text`

Another example:

```json
"seed": { "node_id": "3", "input_name": "seed" }
```

Meaning:

- find node `3`
- write the panel seed into its `inputs.seed`

## SaveImage Node

Your workflow must include a node that saves the image.

The baseline wrapper uses:

- `output_prefix`

to override the filename prefix sent to the save-image node.

So the binding for `output_prefix` must point to the correct SaveImage node input.

Also set:

- `result_node_id`

to the node id that produces the saved image output record in history.

If this is wrong, the adapter may queue the prompt correctly but fail to retrieve the output image afterward.

## Recommended Bedroom Workflow Checklist

Before pasting the workflow into the baseline file, confirm:

- positive text node exists
- negative text node exists
- sampler node exists
- latent size node exists
- checkpoint loader exists
- VAE decode exists
- SaveImage exists
- workflow runs manually in ComfyUI

If any of these are missing, do not import it yet.

## How To Test After Import

Once the bedroom baseline file contains a real `api_workflow` and corrected bindings, test with:

```bash
RENDER_BACKEND=comfyui npm run render:panel -- state/strange_call/chapter_01.resolved.json p01
```

Use `RENDER_BACKEND=comfyui` on purpose.

Why:

- it prevents silent fallback to stub
- if something is wrong, you get a direct integration error

If the render succeeds, you should see:

- a real image written to `output/base_images/strange_call/chapter_01/p01.png`
- render state updated in `state/strange_call/chapter_01.render-state.json`

Then test:

```bash
npm run typeset:panel -- state/strange_call/chapter_01.resolved.json p01
```

That gives you the first real rendered comic panel with dialogue overlay.

## Recommended Debug Order

If the import fails, debug in this order:

1. does the workflow run inside ComfyUI manually
2. does the API export contain the expected nodes
3. do the wrapper `bindings` match the exported node ids
4. does the save-image node binding point to the right node
5. does `result_node_id` match the actual output-producing node

Do not debug prompt quality until these structural checks pass.

## Common Failure Modes

### Failure: unknown binding target

Cause:

- wrapper node ids do not match exported workflow ids

Fix:

- inspect exported workflow node ids
- update `bindings`

### Failure: prompt queues but no output image found

Cause:

- wrong `result_node_id`
- wrong save node binding

Fix:

- inspect ComfyUI history output structure
- point `result_node_id` to the node that actually outputs images

### Failure: image saves in ComfyUI but adapter does not download it

Cause:

- history retrieval or image view metadata mismatch

Fix:

- inspect the saved image metadata in ComfyUI history
- verify filename, subfolder, and type fields

## Recommended Immediate Workflow Plan

Do this in order:

1. tune the bedroom-night workflow manually in ComfyUI
2. export it in API format
3. paste it into `baseline-bedroom-night-v1.json`
4. fix the binding node ids
5. run `RENDER_BACKEND=comfyui npm run render:panel -- ... p01`
6. run `npm run typeset:panel -- ... p01`

Only after bedroom import works should you move on to:

- `baseline-night-street-v1.json`

And only after that should you touch:

- `baseline-window-reflection-v1.json`
