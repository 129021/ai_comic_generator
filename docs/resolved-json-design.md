# Resolved JSON Design

## Purpose

This document defines the recommended structure for:

- `chapter_01.resolved.json`

The resolved file is the execution-ready version of the source script.

It should be:

- machine-friendly
- stable for reruns
- independent from anchor expansion logic
- explicit about rendering and output paths

## Design Principle

The source script is for editing.
The resolved file is for execution.

That means the resolved file should already contain:

- final positive prompt
- final negative prompt
- final render settings
- final output paths
- execution state

The resolved file should not require the renderer or typesetter to recompute anchor logic.

## Top-Level Structure

Recommended top-level shape:

```json
{
  "project_id": "strange_call",
  "chapter_id": "chapter_01",
  "chapter_title": "陌生来电",
  "source_script_path": "data/scripts/strange_call/chapter_01.json",
  "generated_at": "2026-03-22T00:00:00+08:00",
  "render_defaults": {
    "image_format": "png",
    "device_scale_factor": 2
  },
  "panels": []
}
```

## Required Panel Structure

Each panel should contain the following groups:

- identity
- story context
- resolved prompt
- resolved render plan
- text content
- output paths
- execution state

Recommended shape:

```json
{
  "panel_id": "p01",
  "sequence": 1,
  "location_id": "bedroom",
  "scene_description": "wide establishing shot, male lead alone in bedroom late at night, scrolling on his phone",
  "resolved_prompt": {
    "positive": "...",
    "negative": "..."
  },
  "resolved_render": {
    "workflow_id": "bedroom-night",
    "workflow_file": "workflows/comfyui/baselines/baseline-bedroom-night-v1.json",
    "model_id": "majicmix-realistic-v7",
    "core": {
      "seed": 101001,
      "width": 1024,
      "height": 1536,
      "steps": 28,
      "cfg": 7,
      "sampler_name": "dpmpp_2m",
      "scheduler": "karras"
    },
    "scene_tuning": {},
    "notes": "preserve everyday bedroom realism"
  },
  "text_content": {
    "dialogue": [],
    "narration": [],
    "bubble_plan": []
  },
  "output": {
    "base_image_path": "output/base_images/strange_call/chapter_01/p01.png",
    "final_image_path": "output/final_comic/strange_call/chapter_01/p01.png"
  },
  "state": {
    "status": "pending",
    "retry_count": 0,
    "approved": false,
    "last_error": "",
    "manual_notes": ""
  }
}
```

## Why `resolved_render` Must Exist

The source script already contains `render_profile`.
But the resolved file should still contain a render-ready copy.

Reason:

- the renderer should not depend on source-script expansion logic
- the renderer should know the exact workflow file to use
- execution should stay stable even if the source script changes later

So the resolved file should not just copy `workflow_id`.
It should also include the actual workflow path chosen at resolve time.

## Recommended `resolved_render` Fields

### Required

- `workflow_id`
- `workflow_file`
- `model_id`
- `core`
- `scene_tuning`
- `notes`

### Core Fields

The `core` object should include:

- `seed`
- `width`
- `height`
- `steps`
- `cfg`
- `sampler_name`
- `scheduler`

### Scene Tuning Fields

The `scene_tuning` object should hold scene-specific render controls only.

Examples:

- `female_implied_strength`
- `reflection_softness`
- `negative_space_strength`
- `street_mood_strength`

This keeps scene-specific knobs separate from universal render controls.

## Recommended `resolved_prompt` Behavior

The resolved file should store the fully assembled prompt text.

That means:

- source anchors are already expanded
- local prompt fragments are already merged
- no render-time prompt construction is required

This simplifies debugging because the exact executed prompt is preserved in one place.

## Recommended `text_content` Behavior

The resolved file should keep text content grouped together:

- `dialogue`
- `narration`
- `bubble_plan`

This allows the typesetting module to read a stable text payload without inspecting unrelated fields.

## Bilingual Support

Since MVP must support both Chinese and English dialogue, the resolved file should allow each dialogue item to carry language metadata when available.

Recommended dialogue item shape:

```json
{
  "speaker": "女主（电话）",
  "text": "你终于接了。",
  "type": "phone_voice",
  "lang": "zh"
}
```

English example:

```json
{
  "speaker": "Female Caller",
  "text": "You finally picked up.",
  "type": "phone_voice",
  "lang": "en"
}
```

If `lang` is absent, the typesetting layer may auto-detect.
But the field should be supported from the beginning.

## Output Path Rules

The resolved file should store final output paths explicitly.

Recommended rule:

- base image path should be deterministic by project, chapter, and panel id
- final image path should follow the same pattern

Example:

- `output/base_images/strange_call/chapter_01/p10.png`
- `output/final_comic/strange_call/chapter_01/p10.png`

## State Rules

Recommended initial state shape:

```json
"state": {
  "status": "pending",
  "retry_count": 0,
  "approved": false,
  "last_error": "",
  "manual_notes": ""
}
```

Recommended status values for V1:

- `pending`
- `rendered`
- `approved`
- `typeset_done`
- `failed`

## What The Resolved File Should Not Include

Do not keep these in the resolved file unless there is a strong debugging need:

- source anchor ids used only for prompt assembly
- raw local prompt fragments
- full editable script metadata not needed for execution
- ComfyUI internal node ids

The resolved file should stay execution-focused.

## Relationship Between Source Script And Resolved File

Source script responsibilities:

- anchor definitions
- editable local prompt fragments
- editable dialogue
- editable render_profile

Resolved file responsibilities:

- fully assembled prompts
- fully chosen workflow file
- stable output paths
- execution state

## Recommended Next Engineering Step

The resolve module should be updated so that:

1. it reads `render_profile` from each source panel
2. it maps `workflow_id` to a baseline workflow file
3. it writes `resolved_render`
4. it writes `resolved_prompt`
5. it writes deterministic output paths

This will make the render module much simpler.
