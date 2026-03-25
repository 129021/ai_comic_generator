# Render Findings (2026-03-22)

## Scope
- Project: `strange_call`
- Chapter: `chapter_01`
- Main local model line: `majicMIX realistic 麦橘写实_v7`
- Runtime: ComfyUI on Apple Silicon MPS

## What Is Confirmed Working
- The full engineering chain is working:
  - source script -> resolved.json
  - resolved.json -> real ComfyUI render
  - rendered base image -> typeset PNG
- Real ComfyUI baseline is connected for `bedroom-night`.
- Real ComfyUI baseline is also connected for `window-reflection`, but output quality is not yet usable.
- Automatic retrieval of rendered files from the ComfyUI output directory is working.

## Strongest Current Results
- `p01` is the strongest usable result on the current mainline.
  - It proves the project can produce a believable bedroom-night setup image with the current stack.
- `p04-branch` is the best current candidate for the phone-call scene family.
  - It is not correct yet, but it is better than the plain mainline and better than the pose-control attempts.

## Panel-by-Panel Findings

### p01
- Status: usable candidate
- Result:
  - ordinary male lead works
  - bedroom-night mood works
  - composition is acceptable for downstream typesetting
- Conclusion:
  - `bedroom-night` mainline is valid for scene-establishing interior shots

### p04
- Status: partially successful, not final
- Mainline problem:
  - often misses the "phone to ear" action
  - may drift into wrong handheld objects
- Prompt-only branch result:
  - improved over mainline
  - removed some obvious action mistakes
  - still did not reliably produce "answering phone"
- Pose-control branch result:
  - not production-worthy on current local setup
  - handcrafted pose map + OpenPose ControlNet did not produce a better result
  - one run drifted into obviously wrong posture/content
- Conclusion:
  - `p04` is not solved
  - prompt-only branch is the best current fallback
  - current local pose-control path is not worth prioritizing further

### p05
- Status: unresolved
- Mainline problem:
  - close-up emotional reaction shot drifted female
- Male-lock branch result:
  - corrected gender drift
  - but introduced a new structural problem: extra/wrong person composition
- Conclusion:
  - the current model line is unstable on close-up emotional single-person reaction shots
  - fixing gender drift alone is not enough

### p10
- Status: unresolved
- Engineering result:
  - real render path works
  - image can be generated and typeset
- Content result:
  - model repeatedly interprets the prompt as female-centric double-figure reflection imagery
  - male reflection does not remain the primary subject
  - "female implied" keeps becoming a full visible person
- Conclusion:
  - current `majicMIX + prompt-only reflection workflow` is a poor fit for this narrative requirement

## Model/Workflow Conclusions

### Where `majicMIX` works
- bedroom establishing shots
- medium interior lifestyle frames
- calm night mood

### Where `majicMIX` struggles
- close-up emotional male reaction shots
- strong action specificity such as "phone to ear"
- restrained narrative reflection scenes where the female presence must stay abstract

### Workflow Conclusions
- `bedroom-night` is the only workflow line that currently counts as validated.
- `window-reflection` is technically connected but not artistically validated.
- `bedroom-night-pose` / pose-control experiments are not worth prioritizing further on the current local MPS setup.

## Practical Decision
- Do not spend more time forcing `p10` on the current prompt-only `majicMIX` reflection route.
- Do not prioritize local pose-control as the next major investment.
- Treat the current stack as:
  - good enough for environment/setup shots
  - unreliable for subtle close-up character acting and abstract reflection storytelling

## Recommended Next Step
Choose one of these:

1. Continue the MVP with the shots the current stack can do well.
   - Use the current model/workflow for easier panels first.
   - Mark difficult panels (`p04`, `p05`, `p10`) as special handling later.

2. Start a small model comparison track specifically for difficult panels.
   - Re-test `p05` and `p10` on another model line.
   - Keep `majicMIX` only for the scenes it is already proving good at.

## Current Best Assets
- Main p01 candidate:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/p01.png`
- Best p04 candidate:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/p04-branch.png`
- Current p10 test outputs:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/p10-real-v1.png`
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/p10-real-v2.png`
- Current p05 test outputs:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/p05-real-v1.png`
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/chapter_01/p05-malelock-v1.png`
