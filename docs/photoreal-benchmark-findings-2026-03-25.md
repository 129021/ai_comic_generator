# Photoreal Benchmark Findings (2026-03-25)

## Scope
- Model: `majicMIX realistic 麦橘写实_v7`
- Goal: test whether the project can pivot from comic-like rendering toward a near-real photographic finish
- Reference direction: Civitai-style window portrait with strong realism, soft backlight, and fashion styling

## Tested Runs

### `r01`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_test/r01.png`
- Settings:
  - `40` steps
  - `CFG 4.5`
  - `DPM++ 3M SDE`
  - `Karras`
  - `768 x 1152`
- Result:
  - strong near-real face, skin, light, and depth-of-field response
  - failed to hold the intended outfit semantics
  - drifted into cream draped fabric instead of a clear red dress + black pantyhose combination

### `r02`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_v2_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_v2_test/r02.png`
- Settings:
  - same sampler/core settings as `r01`
  - prompt-only tightening for:
    - red dress
    - black pantyhose
    - negatives against white/cream wrap fabric
- Result:
  - red dress was successfully locked
  - overall realism remained strong
  - black hosiery partially held, but drifted toward thigh-high / stocking-like interpretation
  - shoe color drifted away from red

### `r03`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_v3_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_v3_test/r03.png`
- Settings:
  - same sampler/core settings as `r02`
  - stronger prompt emphasis on:
    - full black pantyhose from hip to ankle
    - red heels
  - harder negatives against:
    - thigh-high stockings
    - black shoes
    - exposed upper thigh
- Result:
  - red dress remained stable
  - red heels were successfully pulled back
  - black pantyhose disappeared instead of strengthening
- Conclusion:
  - on current local assets, `majicMIX v7` is treating red heels and full-length black hosiery as competing constraints in this scene setup
  - `r02` is still the better wardrobe-balanced image overall

### `r04`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_test/r04.png`
- Added local assets:
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/loras/add_detail.safetensors`
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/loras/FilmVelvia3.safetensors`
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/loras/picxer_real.safetensors`
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/upscale_models/4x-UltraSharp.pth`
- Result:
  - realism and final-image polish improved noticeably
  - red dress remained stable
  - lighting, skin, and overall finish moved closer to the Civitai-style reference direction
  - hosiery still leans toward thigh-high / stocking interpretation
  - shoe color still drifts dark
- Conclusion:
  - adding assets helped more than prompt-only squeezing
  - `r04` is the strongest current "near-real fashion render" output in the repo

### `r05`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_v2_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_v2_test/r05.png`
- Strategy:
  - keep the new asset stack from `r04`
  - return to the more wardrobe-balanced wording used by `r02`
  - add only a light negative against black shoes
- Result:
  - realism and final-image finish stayed strong
  - red dress remained locked
  - hosiery remained more readable than in `r04`
  - shoe color still trends dark, but the overall outfit balance is better than `r04`
- Conclusion:
  - `r05` is the best current combined result
  - this is the strongest candidate so far for a "near-real final comic look" baseline

### `r06`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_v3_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_v3_test/r06.png`
- Strategy:
  - keep the `r05` asset stack and overall wording
  - narrow the iteration to shoe-color recovery only
  - explicitly push red shoe body and red heel
  - explicitly negate black footwear drift
- Result:
  - red shoe color was successfully recovered
  - photoreal finish and face quality stayed strong
  - red dress remained stable
  - hosiery still reads more like thigh-high stockings than full waist-to-ankle pantyhose
- Conclusion:
  - this was a successful narrow correction pass
  - `r06` is now the best local variant when shoe color matters
  - the remaining bottleneck is still hosiery semantics, not general realism

### `r07`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_v4_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_v4_test/r07.png`
- Strategy:
  - keep the `r06` realism and red shoes
  - narrow the pass to continuous full-length pantyhose semantics
  - explicitly negate stocking tops, visible thigh bands, and exposed upper thigh
- Result:
  - hosiery reads more continuously on the visible leg
  - red shoes and overall photoreal finish stayed intact
  - dress structure drifted into an unnatural large side cutout, exposing skin at the hip / upper thigh area
- Conclusion:
  - this is not a net improvement over `r06`
  - pushing hosiery semantics further with prompt wording alone starts to damage garment structure
  - `r06` should remain the active baseline, while `r07` serves as evidence that local prompt-only hosiery tightening is nearing its limit

### `r08`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_openpose_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_openpose_test/r08.png`
- New assets and workflow support:
  - extracted SDPose map:
    - `/Volumes/T7/workspace/ai_comic_generator/output/pose_maps/r06_pose_map.png`
  - new OpenPose workflow:
    - `/Volumes/T7/workspace/ai_comic_generator/workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-openpose-v1.json`
- Strategy:
  - keep the `r06` LoRA realism branch
  - add a low-strength OpenPose ControlNet pass using an SDPose map extracted from `r06`
  - test whether pose locking reduces dress drift while allowing stronger pantyhose wording
- Result:
  - the squatting pose remained recognizable
  - overall photoreal finish stayed acceptable
  - wardrobe semantics drifted into a black top plus red skirt-like lower garment instead of a stable red dress
  - hosiery did not become decisively better than `r06`
- Conclusion:
  - this OpenPose branch is not a net improvement over `r06`
  - the control path is technically working, but the current auto-extracted pose map is too lossy to justify the added complexity here
  - `r08` is useful as engineering proof that the project can extract SDPose maps and run a photoreal OpenPose branch, but it should not replace the current baseline

### `r09`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_realpantyhose_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_realpantyhose_test/r09.png`
- New local assets:
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/loras/RealPantyhose_v1.safetensors`
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/loras/civitai_pantyhose_v1.safetensors`
  - `/Volumes/T7/workspace/ai_comic_generator/ComfyUI/models/loras/stock_hands_sd15_epoch16.safetensors`
- Strategy:
  - keep the `r06` realism branch
  - add a dedicated hosiery LoRA (`RealPantyhose`) at moderate strength
  - explicitly use the LoRA trigger word instead of relying on prompt wording alone
- Result:
  - hosiery texture and coverage moved much more strongly than in the prompt-only and OpenPose branches
  - red shoes remained stable
  - the LoRA over-pulled the clothing balance, making the dress ride too high and exposing too much of the hips / upper thighs
- Conclusion:
  - this is the first strong sign that targeted LoRAs are a better lever than more prompt squeezing
  - the direction is correct, but the first strength setting was too aggressive

### `r10`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_realpantyhose_v2_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_realpantyhose_v2_test/r10.png`
- Strategy:
  - keep the `RealPantyhose` branch from `r09`
  - cut the LoRA strength down to preserve more of the dress structure
  - keep the same near-real prompt and red-shoe constraints
- Result:
  - hosiery realism stayed stronger than `r06`
  - red shoes and the overall photographic finish stayed intact
  - dress structure recovered part of the stability lost in `r09`
  - a visible upper-thigh band / slit issue still remains, so the hosiery problem is improved rather than fully solved
- Conclusion:
  - `r10` is the strongest hosiery-focused branch so far
  - targeted LoRA supplementation is a more effective next-step lever than either harsher prompt wording or the current OpenPose control path

### `r11`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_pantyhose_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_pantyhose_test/r11.png`
- Strategy:
  - keep the `r10` branch structure and strength settings unchanged
  - swap only the hosiery LoRA from `RealPantyhose` to `civitai_pantyhose`
  - use the same seed to make this a direct A/B on LoRA identity rather than on composition luck
- Result:
  - hosiery continuity stayed strong
  - the clothing semantics drifted badly into a black bodysuit / sheer-top interpretation instead of a stable red dress
  - shoe form and color also drifted away from the cleaner red-heel result seen in `r10`
- Conclusion:
  - `civitai_pantyhose` is a worse fit for this scene than `RealPantyhose` at the same low-strength setting
  - this branch is useful as a clean negative A/B, but it should not replace the current candidate line

### `r12`
- Source:
  - `/Volumes/T7/workspace/ai_comic_generator/data/scripts/strange_call/photoreal_window_majicmix_lora_realpantyhose_v3_test.json`
- Output:
  - `/Volumes/T7/workspace/ai_comic_generator/output/base_images/strange_call/photoreal_window_majicmix_lora_realpantyhose_v3_test/r12.png`
- New workflow support:
  - `/Volumes/T7/workspace/ai_comic_generator/workflows/comfyui/baselines/baseline-photoreal-majicmix-lora-realpantyhose-v3.json`
- Strategy:
  - keep the better-behaved `RealPantyhose` branch instead of the weaker `civitai_pantyhose` swap
  - reduce `RealPantyhose` one more step below `r10`
  - keep the same seed and prompt so the comparison isolates LoRA strength rather than prompt drift
- Result:
  - the red dress structure recovered much more cleanly than in `r09` and `r10`
  - the obvious upper-thigh band / slit problem was reduced substantially
  - hosiery still reads as continuous sheer black coverage, while the overall photoreal finish and red heels stay intact
- Conclusion:
  - this extra-light `RealPantyhose` pass is the strongest hosiery-enhanced branch so far
  - `r12` is now the best current overall candidate on the photoreal window benchmark, not just the best hosiery experiment

## What Is Now Clear
- The project can already reach a much more photographic finish than the earlier office-teacher control-heavy line.
- On local assets alone, `majicMIX v7 + low CFG + DPM++ 3M SDE + single-pass render` is a viable realism baseline.
- The main remaining weakness is not face realism anymore; it is fine-grained wardrobe control.
- dedicated hosiery LoRAs are the right lever, but their identity and strength matter more than prompt wording once the realism baseline is stable

## Practical Decision
- Keep the `photoreal-majicmix` branch as the realism benchmark route.
- Do not reintroduce the second highres latent refinement pass into this realism branch.
- Future iterations on this branch should focus on wardrobe locking rather than general realism recovery.
- Keep `r02` as the current best realism-fashion compromise.
- Keep `r04` as the current best final-image realism benchmark.
- Keep `r06` as the best prompt-only baseline for this photoreal branch.
- Keep `r05` as the safer fallback if we want the previous balance without pushing shoe color.
- Keep `r07` only as a diagnostic run showing the tradeoff of harder hosiery constraints.
- Keep `r08` only as a control-method probe, not as an active candidate.
- Keep `r10` as the useful midpoint showing that lower `RealPantyhose` strength improves balance.
- Keep `r11` only as the A/B evidence that `civitai_pantyhose` is not the right replacement path here.
- Keep `r12` as the current best overall candidate and the best hosiery-enhanced candidate.

## Recommended Next Step
Do not spend more time swapping hosiery LoRAs at the same setting.

The `r11` A/B made that question much clearer:
- `RealPantyhose` is the better branch to keep
- `civitai_pantyhose` is not the right next lever for this scene

The next practical move is:
- treat `r12` as the active candidate for this photoreal branch
- keep `r06` as the prompt-only control baseline for comparison
- if another pass is needed, only do very narrow tuning around `r12` rather than reopening the entire prompt stack

The most useful follow-up experiments from here are:
- a tiny `RealPantyhose` neighborhood sweep around `r12` rather than a brand-new LoRA family
- or a small seed sweep on the `r12` workflow to see whether the recovered dress structure stays stable across samples
