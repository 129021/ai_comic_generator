# Model Evaluation: majicMIX realistic

## Purpose

This document defines a practical Stage 0 evaluation plan for the locally downloaded model:

- `majicMIX realistic`

The goal is not to prove that this model is the best possible model.
The goal is to determine whether it is suitable as:

- a primary Stage 0 test model
- a scene-specific support model
- or a model that should be removed from the main route

## Current Working Assumption

Current assumption:

- `majicMIX realistic` can be tested as an early rendering candidate
- but it should not be assumed to be the final V1 production model before evaluation

Reasons:

- likely useful for realistic close-up atmosphere
- uncertain cross-panel consistency behavior
- uncertain suitability for comic-friendly negative space
- commercial usage status must still be verified on the actual model page and associated license notes

## Evaluation Scope

This evaluation should only answer these questions:

- can the male lead remain visually stable enough
- can night mood be rendered convincingly
- can the female caller stay implied rather than fully literal
- can composition leave enough room for later dialogue typesetting

## Test Panels

Only these three panels should be used in the first evaluation round.

### Panel `p01`

Purpose:

- test male lead base appearance
- test bedroom realism
- test emotional night atmosphere

Look for:

- believable ordinary urban male look
- non-generic bedroom composition
- convincing warm lamp and phone-light contrast
- emotional loneliness rather than empty room only

### Panel `p10`

Purpose:

- test female implied presence control
- test reflection composition
- test ambiguity without horror drift

Look for:

- female presence remaining partial or abstract
- no accidental full female reveal
- no ghost or horror look
- reflection still readable and aesthetically controlled

### Panel `p16`

Purpose:

- test suspenseful night intersection mood
- test open composition
- test future dialogue placement room

Look for:

- enough negative space for speech bubbles
- stable night street tone
- emotional suspense rather than generic city scene
- male lead still believable in wider framing

## Test Procedure

For each selected panel:

- run at least 3 generations
- keep prompt structure stable
- vary seed only for the first pass
- record results before changing workflow or major parameters

This is important because a lucky single image is not enough for a production pipeline.

## Minimum First-Round Test Count

- `p01`: 3 images
- `p10`: 3 images
- `p16`: 3 images

Total first-round test set:

- 9 images minimum

## Scoring Rubric

Each image should be scored from `1` to `5` on these dimensions:

- `character_stability`
- `mood_quality`
- `typeset_friendly_composition`
- `rerun_consistency`

Meaning:

- `1` = unacceptable
- `2` = weak
- `3` = usable with concerns
- `4` = strong
- `5` = clearly suitable

## Recommended Issue Tags

If an image has problems, tag them consistently using labels like:

- `male_too_soft`
- `face_drift`
- `style_drift`
- `composition_too_full`
- `female_too_literal`
- `lighting_dirty`
- `too_ai_photo`
- `not_typeset_friendly`
- `mood_too_flat`

## Evaluation Checklist

### For `p01`

Checklist:

- does the male lead look like an ordinary urban man rather than a glamour portrait
- does the face feel stable and believable
- do the bedroom props feel natural
- does the image carry emotional loneliness
- would this panel work as the visual opening of a story

### For `p10`

Checklist:

- is the female caller still implied rather than fully shown
- does the result avoid ghost or horror styling
- is the reflection composition readable
- does the image still feel intimate rather than supernatural
- would this panel fit the tone of `Strange Call`

### For `p16`

Checklist:

- is there enough empty space for later text
- does the night intersection feel suspenseful
- does the male lead remain visually coherent
- is the lighting mood compatible with the rest of the story
- would this image work as a chapter hook panel

## Decision Rules

### Keep As Primary Stage 0 Test Model

Choose this outcome if:

- `p01` has at least 2 acceptable outputs
- `p16` has at least 2 acceptable outputs
- `p10` has at least 1 acceptable output without over-literal female reveal
- the overall visual tone feels compatible across all 3 test panels

### Keep As Scene-Specific Support Model

Choose this outcome if:

- the model works well for close-up emotional scenes
- but struggles with wide scenes, negative space, or cross-panel stability

This is a realistic possibility for `majicMIX realistic`.

### Remove From Main Route

Choose this outcome if:

- the male lead drifts too much between images
- wide scenes are consistently too busy
- female implied-presence panels repeatedly become too literal
- reruns are too unstable to support repeatable production

## Current Hypothesis

Current hypothesis before testing:

- likely strongest on close-up, realistic, emotional scenes
- worth testing for `p01`
- potentially useful for `p10`
- may struggle more on `p16`

If that hypothesis is confirmed, the model may still be useful even if it is not the main all-purpose V1 model.

## Commercial Caution

Before relying on this model for a commercial direction, verify:

- the commercial usage statement on the exact Liblib model page
- any linked upstream licensing conditions
- any restrictions introduced by companion LoRAs, checkpoints, or workflow assets

Do not assume that download availability equals commercial safety.

## Recommended Test Log Format

For each test image, record:

- date
- panel id
- workflow id
- seed
- model
- key parameters
- short result summary
- 4 rubric scores
- issue tags
- keep or discard decision

## Suggested Final Outcome Format

At the end of evaluation, conclude with one of:

- `majicMIX realistic is retained as the primary Stage 0 test model`
- `majicMIX realistic is retained as a scene-specific support model`
- `majicMIX realistic is removed from the main route`

## Next Step After This Evaluation

If evaluation is successful:

- include the model in Stage 0 render experiments
- map it to the most suitable workflow type

If evaluation is mixed:

- keep it only for the panel classes where it performs well

If evaluation fails:

- move on quickly to the next candidate model
