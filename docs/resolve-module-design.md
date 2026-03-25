# Resolve Module Design

## Purpose

This document defines the input, output, and transformation rules for the MVP resolve module.

The resolve module is responsible for converting:

- editable source script JSON

into:

- execution-ready resolved JSON

This is the first real processing stage in the pipeline.

## Role In The Pipeline

Pipeline order:

1. source script
2. resolve
3. render
4. typeset
5. override and rerun

The resolve module exists so that downstream modules do not need to understand:

- anchor expansion
- workflow mapping rules
- prompt assembly rules
- output path conventions

## Input

Primary input:

- source script file

Current example:

- `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/chapter_01.json`

Optional secondary input:

- override file

Expected future path:

- `/Volumes/T7/workspace/ai_comic_generator/state/strange_call/chapter_01.overrides.json`

## Output

Primary output:

- resolved chapter file

Expected path:

- `/Volumes/T7/workspace/ai_comic_generator/state/strange_call/chapter_01.resolved.json`

This file should be sufficient for:

- render module execution
- typeset module execution
- panel rerun logic

## Source Fields The Resolve Module Must Read

Top-level fields:

- `project_id`
- `chapter_id`
- `chapter_title`
- `style_profile`
- `character_anchors`
- `scene_anchors`
- `panels`

Per-panel fields:

- `panel_id`
- `sequence`
- `location_id`
- `characters`
- `render_profile`
- `scene_description`
- `prompt_build`
- `dialogue`
- `narration`
- `bubble_plan`
- `status`
- `retry_count`
- `manual_notes`

## Transform Responsibilities

The resolve module should perform these transformations:

### 1. Validate Source Data

It should verify that required fields exist and are structurally valid.

Examples:

- panel ids are unique
- required top-level anchors exist
- `render_profile.workflow_id` is present
- `prompt_build.scene_ref` is present
- dialogue items are arrays
- bubble plans are arrays

### 2. Apply Overrides

If an override file is present, the resolve module should apply it before final assembly.

Typical override targets:

- `prompt_build.local_positive`
- `prompt_build.local_negative`
- `bubble_plan`
- `manual_notes`
- `render_profile.core`
- `render_profile.scene_tuning`

Overrides should be panel-scoped.

### 3. Build Final Positive Prompt

The resolve module should assemble:

- character anchor text
- scene anchor text
- local positive prompt
- global positive style suffix

Recommended formula:

```text
positive =
  character anchors +
  scene anchor +
  local positive +
  global positive
```

The final string should be written into:

- `resolved_prompt.positive`

### 4. Build Final Negative Prompt

The resolve module should assemble:

- global negative style string
- local negative prompt

Recommended formula:

```text
negative =
  global negative +
  local negative
```

The final string should be written into:

- `resolved_prompt.negative`

### 5. Resolve Workflow File

The source script should contain:

- `render_profile.workflow_id`

The resolve module should map that to a concrete workflow file.

Recommended initial mapping:

- `bedroom-night` -> `workflows/comfyui/baselines/baseline-bedroom-night-v1.json`
- `window-reflection` -> `workflows/comfyui/baselines/baseline-window-reflection-v1.json`
- `night-street` -> `workflows/comfyui/baselines/baseline-night-street-v1.json`

This mapping should be centralized in code, not duplicated across modules.

The resolved panel should contain both:

- `workflow_id`
- `workflow_file`

### 6. Resolve Render Settings

The resolve module should copy forward:

- `model_id`
- `core`
- `scene_tuning`
- `notes`

into:

- `resolved_render`

This makes the render module stateless with respect to source expansion logic.

### 7. Normalize Dialogue Metadata

The resolve module should preserve dialogue and narration content.

If needed, it may enrich dialogue items with language metadata:

- `lang: "zh"`
- `lang: "en"`

This can be:

- explicitly copied if present
- or inferred later by the typeset layer

First MVP can preserve existing values and allow later detection.

### 8. Generate Deterministic Output Paths

The resolve module should compute output paths for each panel:

- base image path
- final image path

Recommended rule:

- base image: `output/base_images/<project_id>/<chapter_id>/<panel_id>.png`
- final image: `output/final_comic/<project_id>/<chapter_id>/<panel_id>.png`

These should be written into:

- `output.base_image_path`
- `output.final_image_path`

### 9. Initialize Execution State

The resolved panel should include execution state.

Initial recommendation:

```json
"state": {
  "status": "pending",
  "retry_count": 0,
  "approved": false,
  "last_error": "",
  "manual_notes": ""
}
```

If the source panel already has retry-related fields, the resolve module may seed them here.

## Workflow Mapping Rules

Workflow mapping should be explicit and local to the resolve layer.

Recommended rule:

- input is logical workflow id from source script
- output is concrete baseline workflow file path

This prevents the render layer from having to guess or hardcode business logic.

## Recommended Function Boundaries

Suggested logical functions:

- `validateSourceScript(script)`
- `applyOverrides(script, overrides)`
- `buildResolvedPrompt(script, panel)`
- `resolveWorkflowFile(workflowId)`
- `buildResolvedRender(panel)`
- `buildOutputPaths(projectId, chapterId, panelId)`
- `buildInitialState(panel)`
- `resolveChapter(sourceScriptPath, overridesPath?)`

## Expected Error Cases

The resolve module should fail clearly on:

- unknown workflow id
- missing scene anchor
- missing character anchor reference
- invalid panel id duplication
- invalid prompt_build object
- malformed render_profile

These failures should happen before rendering begins.

## Resolve Module Success Criteria

The resolve module is successful if:

- it converts a source script into a valid resolved chapter file
- every panel has final positive and negative prompt text
- every panel has a resolved workflow file
- every panel has deterministic output paths
- downstream render and typeset modules can execute without re-reading source anchors

## Future Extension Points

This design should allow later support for:

- multiple models per chapter
- different workflow baselines per panel group
- richer override merging
- panel approval state reuse
- bilingual dialogue metadata enrichment

## Immediate Next Implementation Goal

The next practical coding target should be:

1. define source and resolved TypeScript types
2. implement workflow id mapping
3. implement prompt assembly
4. implement resolved file writing
