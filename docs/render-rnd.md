# Render R&D Plan

## Purpose

This document defines `Stage 0` for the MVP:

- render workflow research and development

The goal of Stage 0 is not to produce a full chapter.
The goal is to prove that the local image generation stack can support the specific visual requirements of this project with acceptable stability.

Only after Stage 0 is successful should the main pipeline engineering move forward at full speed.

As of the current product decision, the render mainline is no longer neutral.
Stage 0 should now prioritize the render stack defined in:

- `/Volumes/T7/workspace/ai_comic_generator/docs/comfyui-3d-render-prd.md`

Older routes such as `majicMIX bedroom-night` should be treated as comparison lines unless explicitly promoted again.

## Why Stage 0 Exists

ComfyUI is not plug-and-play for this project.

This system depends on:

- cross-panel character stability
- scene tone consistency
- controllable composition
- repeatable output quality
- panel-level rerun behavior

If those are not validated first, downstream engineering work will be built on an unstable rendering foundation.

## Stage 0 Objectives

Stage 0 is successful if it can establish:

- a workable ComfyUI-based render path for the current story sample
- 2 to 3 reusable workflow templates
- a small set of default render parameters
- a repeatable process for testing and comparing output quality

## Current Story Sample

Project:

- `strange_call`

Sample script:

- `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/chapter_01.json`

The first chapter contains 16 panels, but Stage 0 should not start with all 16.

## First Test Panels

Stage 0 should begin with these three panels only.

### Panel `p01`

Purpose:

- validate male lead base appearance
- validate bedroom night atmosphere
- validate everyday object realism

Key risks:

- male lead face instability
- room style drifting too generic
- lighting lacking emotional mood

### Panel `p10`

Purpose:

- validate female implied-presence treatment
- validate reflection-based composition
- validate ambiguity without literal supernatural visuals

Key risks:

- female caller becoming too literal
- accidental ghost or horror look
- reflection composition becoming messy

### Panel `p16`

Purpose:

- validate empty night intersection composition
- validate suspenseful negative space
- validate typesetting-friendly framing

Key risks:

- composition becoming too busy
- no room for dialogue bubbles
- night street mood not matching earlier panels

## Initial Workflow Set

Do not attempt one universal workflow for all panel types in Stage 0.

Start with three workflow templates:

- `workflow_bedroom_night.json`
- `workflow_window_reflection.json`
- `workflow_night_street.json`

Recommended mapping:

- `workflow_bedroom_night.json` for `p01` to `p08`
- `workflow_window_reflection.json` for `p09` to `p11`
- `workflow_night_street.json` for `p12` to `p16`

## Recommended Stage 0 Order

### Step 1: Stabilize `p01`

Focus:

- male lead look
- bedroom color tone
- everyday realism
- compatibility of the current mainline render stack with the chapter sample

Do not continue until `p01` is acceptable.

### Step 2: Stabilize `p16`

Focus:

- night street mood
- open composition
- space for later text placement

Do not continue until `p16` is acceptable.

### Step 3: Tackle `p10`

Focus:

- implied feminine presence
- controlled reflection styling
- no over-literal female reveal

This should be treated as the hardest Stage 0 panel.

## Required Parameter Tracking

Each workflow test should record at least:

- `model`
- `vae`
- `sampler`
- `scheduler`
- `steps`
- `cfg`
- `seed`
- `seed_strategy`
- `width`
- `height`
- `hires_fix`
- `consistency_method`
- `control_method`
- `negative_prompt_template`

If any workflow uses references or consistency add-ons, record that clearly.

For the current mainline, record additionally:

- FaceID model used
- InsightFace runtime path
- ControlNet model used
- face-structure preprocessor used

## Experiment Log Format

Each Stage 0 experiment should log:

- date
- panel id
- workflow id
- prompt version
- parameter set
- seed
- result summary
- decision
- issue tags

Recommended issue tags:

- `face_drift`
- `style_drift`
- `composition_too_full`
- `female_too_literal`
- `lighting_dirty`
- `not_typeset_friendly`
- `mood_too_flat`

## Evaluation Criteria

### Character Stability

For `p01` and `p16`, the male lead should still feel like the same person.

The standard is not perfect identity lock.
The standard is consistent-enough storytelling continuity.

### Scene Tone Consistency

Bedroom and night street scenes should feel like they belong to the same project and same chapter.

### Composition Quality

Each tested image should preserve practical room for later speech bubbles and narration.

### Female Presence Control

For `p10`, the female caller must remain implied rather than fully manifested.

### Retry Predictability

Rerunning the same panel with the same setup should not produce completely incompatible outcomes every time.

## Stage 0 Exit Criteria

Stage 0 can be considered complete when all of the following are true:

- `p01` produces at least 3 acceptable outputs with basic male-lead consistency
- `p16` produces at least 3 acceptable outputs with stable mood and usable negative space
- `p10` produces at least 1 to 2 acceptable outputs without over-literal female reveal
- 2 to 3 workflow templates have been selected as the baseline templates
- a default parameter baseline exists for each template
- experiment results are documented clearly enough to explain what worked and what failed

## What Not To Do In Stage 0

- do not start by testing all 16 panels
- do not switch models too aggressively between tests
- do not chase maximum resolution first
- do not begin with complex UI work
- do not modify too many variables at the same time

Stage 0 should reduce uncertainty, not create more of it.

## Required Outputs Of Stage 0

By the end of Stage 0, the repo should ideally contain:

- `/Volumes/T7/workspace/ai_comic_generator/workflows/comfyui/workflow_bedroom_night.json`
- `/Volumes/T7/workspace/ai_comic_generator/workflows/comfyui/workflow_window_reflection.json`
- `/Volumes/T7/workspace/ai_comic_generator/workflows/comfyui/workflow_night_street.json`
- `/Volumes/T7/workspace/ai_comic_generator/docs/render-rnd.md`
- a parameter baseline reference
- an experiment log

## Relationship To MVP Engineering

Once Stage 0 is complete, the engineering pipeline can proceed with much lower risk:

- script resolve
- panel render
- panel typeset
- chapter render
- chapter typeset
- overrides and rerun

Without Stage 0, pipeline engineering risks optimizing around unstable rendering behavior.

## Next Recommended Action

The next practical action should be:

1. create the `workflows/comfyui/` directory
2. choose the first ComfyUI baseline workflow for `p01`
3. begin experiment logging for `p01`
