# Vocab Escape

Standalone static Three.js game for HappyLearning. German interface, Spanish answer doors. Touch joystick and swipe look; WASD and mouse (or arrow keys) on desktop. Approach a door and tap the action button or press E. Escape pauses.

## Local preview

Serve the repository's `public` directory over HTTP and open `/pages/backrooms/index.html`. Do not open the HTML as a `file://` URL: vocabulary fetch and JavaScript modules require a web server. The HappyLearning Next.js development server also serves this route.

## Integration

The homepage entry is in `lib/pages.js`. All game assets live here; Three.js 0.170.0 is vendored with its MIT license. No runtime CDN, API, login, storage or backend is used. Deploy through the existing HappyLearning Vercel project after reviewing the changes.

## Vocabulary

`words.tsv` was downloaded from https://github.com/adriemel/tap-to-vocab/blob/main/data/words.tsv on 2026-09-14. Replace this file to update vocabulary. Required tab-separated headers: category, es, de. Additional columns are ignored. Leading/trailing whitespace and Unicode normalization are handled; incomplete rows and categories starting with x (case insensitive) are excluded. Identical German prompts within a category are grouped with accepted Spanish alternatives, preventing a known valid answer from becoming a distractor. No vocabulary text is hard-coded.

Accuracy is first-attempt correctness among encountered questions. Session size counts unique German prompts with at least one distinct distractor. Single-answer categories cannot start.

## Verification

Run `node tests/backrooms/vocabulary.test.mjs` from the repository root for vocabulary and session checks. Browser checks were run in headless Edge with portrait touch emulation and desktop resizing: rendering, movement, door interaction, pause/resume, restart, three-heart loss, five-room completion, escape animation and TSV load failure. Full-category completion is covered by session tests. Actual iPad/iPhone Safari performance, touch feel and device speech voices still need hands-on verification. The game is linked from the Games section on the HappyLearning homepage.

Third-strike defeat uses an original vector creature with a knife, a single red flash and a German death message. Reduced-motion preferences disable the rush and flashing. Ambient audio is synthesized locally; mute, pause and exit stop the drone.
