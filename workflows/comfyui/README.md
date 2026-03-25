# ComfyUI Workflow Organization

## Goal

This directory stores all ComfyUI workflow assets used by the project.

The structure is designed to keep:

- temporary experiments
- reusable scene templates
- approved baseline workflows
- deprecated or replaced workflows

strictly separated.

This is important because the project will iterate heavily during Stage 0 Render R&D.

## Directory Structure

```text
workflows/comfyui/
├── README.md
├── templates/
├── experiments/
├── baselines/
└── archives/
```

## Folder Meanings

### `templates/`

Purpose:

- scene-type reusable workflow templates
- not yet final production baselines
- intended to be copied or evolved into approved baselines later

Examples:

- `template-bedroom-night-v1.json`
- `template-window-reflection-v1.json`
- `template-night-street-v1.json`

Use this folder when:

- you have a workflow that is structurally useful
- but still expect tuning work

### `experiments/`

Purpose:

- one-off or short-lived workflow variants
- parameter tests
- branch experiments for difficult panels

Examples:

- `exp-p01-bedroom-seedstudy-v1.json`
- `exp-p10-female-implied-softblur-v2.json`
- `exp-p16-wide-negative-space-v1.json`

Use this folder when:

- testing prompt/control changes
- testing model variants
- testing parameter sweeps
- testing hard problem panels

### `baselines/`

Purpose:

- approved workflows ready for Stage 0 baseline use
- these are the workflows the pipeline is expected to call by default

Examples:

- `baseline-bedroom-night-v1.json`
- `baseline-window-reflection-v1.json`
- `baseline-night-street-v1.json`

Use this folder when:

- a workflow has passed repeated manual evaluation
- it is suitable to be referenced by workflow id in the pipeline

### `archives/`

Purpose:

- old workflows no longer in active use
- replaced baseline versions
- experiments worth keeping for historical reference

Examples:

- `archive-baseline-bedroom-night-v1.json`
- `archive-exp-p10-literal-female-failed-v1.json`

Use this folder when:

- the workflow is no longer active
- but should be retained for comparison or rollback context

## Naming Rules

Use lowercase kebab-case only.

Recommended naming format:

`<category>-<scene-or-panel>-<variant>-v<number>.json`

Examples:

- `template-bedroom-night-v1.json`
- `baseline-night-street-v2.json`
- `exp-p10-female-implied-softblur-v3.json`

## Naming Principles

### Include category first

Good:

- `baseline-bedroom-night-v1.json`

Avoid:

- `bedroom-night-baseline.json`

Reason:

- easier sorting
- clearer visual grouping

### Prefer scene-based names for reusable workflows

Good:

- `template-bedroom-night-v1.json`
- `baseline-window-reflection-v1.json`

Avoid using panel ids for workflows that should be reused across many panels.

### Use panel ids only for targeted experiments

Good:

- `exp-p10-female-implied-softblur-v1.json`
- `exp-p16-wide-empty-road-v2.json`

This makes it obvious that the workflow exists for a specific problem panel.

### Always version files

Good:

- `baseline-night-street-v1.json`
- `baseline-night-street-v2.json`

Do not overwrite successful baselines casually.

Versioning is required so experiments remain explainable.

## Recommended Active Baseline Set For Current MVP

The first approved workflow set should aim for:

- `baseline-bedroom-night-v1.json`
- `baseline-window-reflection-v1.json`
- `baseline-night-street-v1.json`

These correspond to the current story sample:

- bedroom interior panels
- reflective ambiguous window panels
- night street and convenience store panels

## Workflow Promotion Rules

Use this promotion path:

1. idea starts in `experiments/`
2. useful reusable structure moves into `templates/`
3. validated stable workflow becomes `baselines/`
4. replaced files move into `archives/`

This avoids promoting unstable experiments directly into production use.

## What Counts As A Baseline

A workflow should only be promoted into `baselines/` if:

- it has been tested on the intended panel type repeatedly
- output quality is consistent enough
- composition is suitable for typesetting
- the team can explain why it works
- default parameter values are documented

## Companion Notes

Every approved baseline workflow should have associated notes recorded somewhere in docs or logs, including:

- target scene type
- intended model
- key parameters
- known weaknesses
- example successful panels

## Current Photoreal Default

The `workflow_id` alias `photoreal-majicmix-lora` should always point to the current default photoreal window baseline.

As of the latest hosiery benchmark promotion:

- `photoreal-majicmix-lora` points to `baseline-photoreal-majicmix-lora-realpantyhose-v3.json`
- `photoreal-majicmix-lora-promptonly` preserves the earlier prompt-only branch for reproducing `r04` to `r07`

This keeps new photoreal runs on the current best baseline while preserving reproducibility for older benchmark scripts.

## Do Not Mix These Concepts

Avoid mixing:

- model identity
- workflow structure
- experiment purpose

For example, do not name a file only by model name.

Bad:

- `majicmix-v1.json`

Better:

- `template-bedroom-night-majicmix-v1.json`

This keeps the filename meaningful even after model changes.

## Suggested Next Files

The first workflow files to create later should be:

- `workflows/comfyui/templates/template-bedroom-night-v1.json`
- `workflows/comfyui/templates/template-window-reflection-v1.json`
- `workflows/comfyui/templates/template-night-street-v1.json`

These do not need to be perfect immediately.
They are the starting point for Stage 0 experiments.
