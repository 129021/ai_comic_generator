# Female Teacher Findings (2026-03-24)

## Scope
- Project: `strange_call`
- Test lines:
  - `female_teacher_sdxl_test`
  - `female_teacher_highres_test`
- Evaluation date: March 24, 2026

## What Is Confirmed Working
- The office-teacher experiment line is fully connected end to end:
  - source script -> resolved.json
  - resolved.json -> real ComfyUI render
  - rendered base image -> typeset HTML/PNG
- `scene_tuning` bindings for staged reference assets are wired for:
  - face reference
  - pose map
  - style reference
  - composition reference

## Visual Findings

### `female_teacher_sdxl_test` (`s01`)
- Status: stronger current result
- What worked:
  - office shelves, desk, and paper props remained readable
  - facial rendering is cleaner and more believable than the highres majicMIX branch
  - clothing pattern control is present enough to count as a real reference-following result
- What failed:
  - framing drifted away from the requested full-body shot
  - the phone action is weak and not clearly readable
  - composition leans toward a fashion portrait instead of a comic-ready full scene
- Conclusion:
  - this is the best current image of the March 24, 2026 office-teacher comparison
  - but it is still not a production-ready panel

### `female_teacher_highres_test` (`t01`)
- Status: technically successful, visually weak
- What worked:
  - the two-stage highres route produced a clean `1024 x 1536` output
  - full-body silhouette retention is better than the SDXL line
- What failed:
  - scene props largely collapsed; the office setting is no longer convincing
  - the phone action is effectively missing
  - the image became too soft, hazy, and poster-like for the requested crisp 3D comic material response
  - facial likeness and material separation are weaker than expected from the workflow intent
- Conclusion:
  - the current `majicMIX + highres v3` route should not be treated as the office-teacher mainline

### `female_teacher_highres_v4_test` (`t02`)
- Status: real render completed, but not an improvement
- What changed:
  - kept `majicMIX realistic v7`
  - tightened stage-2 denoise
  - raised composition influence
  - reduced style takeover
  - strengthened pose retention
- What improved:
  - full-body framing remained present
  - image still lands as a real `1024 x 1536` render, not a stub
- What failed:
  - the result became even softer and less readable than `t01`
  - the office props are still too abstract to count as a believable study room
  - the phone action is still not clearly readable
  - facial detail and textile detail did not recover despite the tuning pass
- Conclusion:
  - the current failure is not just "weights need a little adjustment"
  - this branch is likely bottlenecked by the underlying reference/control setup, not only by checkpoint strength

### `female_teacher_v4_nohires_test` (`t03`)
- Status: strongest current `majicMIX` result in this office-teacher branch
- What changed:
  - kept the same `majicMIX realistic v7` control stack as `t02`
  - removed the second latent upscale + 12-step refinement stage
  - decoded the first 22-step output directly
- What improved:
  - image clarity recovered immediately
  - facial features, jacket edges, shoes, and overall silhouette are much cleaner than `t01` and `t02`
  - the result no longer has the heavy soft-focus wash that made the highres variants feel poster-like
- What still failed:
  - the office props are still simplified and do not yet read as a convincing study room
  - the phone action is still missing or unreadable
  - tights pattern and lace material specificity are still weaker than the target brief
- Conclusion:
  - the second 12-step highres pass was a major source of degradation on this local setup
  - future `majicMIX` office-teacher iterations should use the no-highres branch as the default baseline

## Additional Technical Note
- ComfyUI logs repeatedly warn that the FaceID reference image is not square and is being center-cropped by the CLIP image processor.
- This increases the chance that the actual face focus is being weakened before the likeness controls are applied.
- A cleaned square face reference should be tested before spending more time on another weight-only `majicMIX` iteration.

## Practical Decision
- Keep `female_teacher_sdxl_test` as the current best comparison output for this scene family.
- Treat `female_teacher_highres_test` as an engineering proof that the topology runs, not as a validated artistic route.
- Treat `female_teacher_highres_v4_test` as evidence that the current `majicMIX` line is still not solving the office-teacher target.
- Treat `female_teacher_v4_nohires_test` as the best current `majicMIX` baseline for further prompt/control experiments.
- Do not promote the current `majicMIX` highres result into the mainline PRD.

## Recommended Next Step
Before another full workflow rewrite, test a cleaned square FaceID reference on the current no-highres office-teacher line.

Why this is the right next move:
- the logs point to a concrete technical weakness instead of a vague aesthetic guess
- both `majicMIX` highres variants failed even after meaningful weight changes
- removing the second highres pass already recovered clarity, so the next test should keep that gain and target the remaining semantic misses
- a square face reference is a smaller and cleaner variable change than another checkpoint swap

If that still fails, the next checkpoint comparison should focus on:
- `SDXL` as the strongest current office composition line
- a newly added `xxmix9realistic` style checkpoint if it is installed locally

## Current Best Assets
- Best current office-teacher comparison image:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/female_teacher_sdxl_test/s01.png`
- Current highres comparison image:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/female_teacher_highres_test/t01.png`
- Current highres v4 comparison image:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/female_teacher_highres_v4_test/t02.png`
- Current best `majicMIX` no-highres comparison image:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/female_teacher_v4_nohires_test/t03.png`
