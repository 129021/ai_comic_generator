# Model Comparison Plan

## Current Limitation
- A real model comparison cannot start yet because there is only one usable text-to-image checkpoint installed locally:
  - `/Users/wangjianqin/.gemini/antigravity/scratch/ComfyUI/models/checkpoints/majicMIX realistic 麦橘写实_v7.safetensors`
- This file is **not** a second comparison candidate:
  - `/Users/wangjianqin/.gemini/antigravity/scratch/ComfyUI/models/checkpoints/sdpose_wholebody_fp16.safetensors`
  - It is part of the pose-control line, not a normal panel-generation base model.

## Goal
Compare one known baseline model against one additional local checkpoint on the most difficult panels:
- `p05` for close-up emotional male reaction
- `p10` for restrained reflection storytelling

## Comparison Rules
- Keep workflow constant where possible.
- Change only the model line first.
- Use the same:
  - panel
  - seed
  - width / height
  - steps
  - cfg
  - sampler
  - scheduler
- Evaluate content fit, not just image prettiness.

## Current Baseline
- Model slot A:
  - `majicmix-realistic-v7`
  - actual file: `majicMIX realistic 麦橘写实_v7.safetensors`

## Pending Slot
- Model slot B:
  - not installed yet
  - should be a normal text-to-image checkpoint compatible with the current local ComfyUI line

## First Comparison Matrix

### p05
- Compare:
  - `majicmix-realistic-v7`
  - `candidate-model-b`
- Criteria:
  - male face stability
  - no feminine drift
  - no extra people
  - emotional subtlety

### p10
- Compare:
  - `majicmix-realistic-v7`
  - `candidate-model-b`
- Criteria:
  - male reflection remains primary subject
  - female presence stays abstract
  - no full female reveal
  - no drift into couple portrait

## Output Naming
- Suggested filenames:
  - `p05-modelA.png`
  - `p05-modelB.png`
  - `p10-modelA.png`
  - `p10-modelB.png`

## Decision Rule
- Keep `majicMIX` as the environment / medium-shot line if it remains strongest there.
- Switch only the hard panels to the second model if:
  - `p05` improves on male close-up stability
  - or `p10` improves on reflection control

## Important Constraint
- Do not change model and workflow structure at the same time during the first comparison pass.
- Otherwise the result will be hard to interpret.
