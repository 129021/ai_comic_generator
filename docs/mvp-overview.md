# AI Comic Generator MVP Overview

## Current Direction

This MVP remains a local-first, semi-automated comic production pipeline.

Its current main render line is now defined by the ComfyUI 3D realistic render PRD:

- `/Volumes/T7/workspace/ai_comic_generator/docs/comfyui-3d-render-prd.md`

The top-level workflow remains:

`structured script -> resolved prompts -> base image render -> dialogue typesetting -> panel-level retry`

But the `render` stage is no longer defined by the earlier `majicMIX bedroom-night` line as the project mainline.
The project mainline now assumes a ComfyUI render stack centered on:

- `Deliberate_v2`
- `IP-Adapter FaceID`
- face-structure control via ControlNet

The project is intentionally **not** starting from raw `.txt` novel ingestion.
For MVP, the starting input is a structured script JSON.

## Business Direction

The current business direction is the "safer third path":

- do not start with unauthorized erotic novel adaptation
- do not start with explicit adult content
- first validate the workflow with original or lower-risk content
- keep the system commercially flexible for both domestic and overseas markets

Because market direction is not finalized yet, the typesetting layer must support:

- Chinese dialogue
- English dialogue

This bilingual requirement is part of MVP, not a later enhancement.

## Current Story Sample

The current MVP sample project is:

- project: `strange_call`
- chapter: `chapter_01`
- title: `陌生来电`

Story type:

- urban emotional suspense
- slight sensual tension
- non-explicit
- low scene complexity
- dialogue-driven

Why this sample was chosen:

- small cast
- few scenes
- controllable continuity requirements
- suitable for testing prompt consistency and typesetting

## Canonical Script Sample

Current editable source script:

- `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/chapter_01.json`

This file contains:

- style anchors
- character anchors
- scene anchors
- 16 panel definitions
- prompt fragments
- dialogue and narration content
- bubble placement hints

## Data Model Strategy

There are two intended data layers.

### 1. Editable Script Layer

Human-friendly source file:

- `chapter_01.json`

Purpose:

- manual editing
- anchor management
- local prompt adjustment
- dialogue editing

### 2. Resolved Execution Layer

Generated file:

- `chapter_01.resolved.json`

Purpose:

- fully assembled prompts
- stable output paths
- execution state
- retry handling

## MVP Scope

### Included

- read structured script JSON
- resolve anchors into final prompts
- render base images panel by panel
- typeset dialogue onto images
- support panel-level rerun
- store execution state
- support Chinese and English dialogue rendering
- shift the render mainline toward the 3D realistic ComfyUI stack described in the main render PRD

### Excluded For MVP

- raw text to script generation
- fully automatic novel segmentation
- intelligent face-aware bubble avoidance
- GUI editor
- multi-chapter scheduler
- cloud rendering

## Pipeline Stages

### Stage 1: Script Resolve

Input:

- source script JSON

Output:

- resolved execution JSON

Responsibilities:

- validate fields
- expand anchors
- build final positive and negative prompts
- assign output paths

### Stage 2: Base Image Render

Input:

- resolved JSON

Output:

- panel base images
- render state updates

Responsibilities:

- render each panel serially
- support rerun by panel id
- record errors
- follow the current main render PRD for the render stack
- keep earlier model lines as comparison or fallback lines, not as the declared mainline

### Stage 3: Typesetting

Input:

- resolved JSON
- base images

Output:

- final comic panel images

Responsibilities:

- render dialogue bubbles and narration
- support `normal`, `phone_voice`, `narration`, `thought`
- support Chinese and English text
- support bilingual font configuration
- support bilingual line-breaking behavior

### Stage 4: Retry And Overrides

Input:

- source script
- resolved JSON
- override file

Output:

- updated resolved JSON or rerun results

Responsibilities:

- override per-panel prompt fragments
- override bubble placement
- rerender or re-typeset a single panel

## Directory Plan

- `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/chapter_01.json`
- `/Volumes/T7/workspace/ai_comic_generator/state/strange_call/chapter_01.resolved.json`
- `/Volumes/T7/workspace/ai_comic_generator/state/strange_call/chapter_01.render-state.json`
- `/Volumes/T7/workspace/ai_comic_generator/state/strange_call/chapter_01.overrides.json`
- `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/`
- `/Volumes/T7/workspace/ai_comic_generator/output/final_comic/strange_call/chapter_01/`
- `/Volumes/T7/workspace/ai_comic_generator/logs/`

## Sample Panel Count

Current sample chapter uses:

- 16 panels

Narrative function of chapter 1:

- establish male lead
- establish mysterious caller
- create intimacy plus unease
- end with a meeting hook

## Key Technical Constraints

- local-first execution
- stage-based pipeline
- single-panel rerun support
- stable JSON-driven workflow
- no assumption that Chinese is the only target language

## MVP Success Criteria

The MVP is considered successful if it can:

- resolve structured script into executable prompt data
- generate base images for panels
- typeset both Chinese and English dialogue clearly
- rerun a single panel without rerunning the full chapter
- preserve state and notes for retry workflows

## Next Recommended Step

The next engineering step should be:

- define codebase directory structure and module ownership

Recommended implementation order:

1. script resolve
2. single-panel render
3. single-panel typeset
4. chapter render
5. chapter typeset
6. overrides and rerun
