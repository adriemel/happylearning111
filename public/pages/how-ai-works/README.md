# Wie KI denkt · How AI thinks

Scrollytelling page (DE/EN toggle) that follows one prompt ("Wie wird das Wetter morgen in Bremen?") from the chat window through harness, tool loop, LLM, tokens, embeddings, transformer layers, attention and softmax, and back out through the nested loops. Audience: teens and curious adults.

## How it works

- One fixed `#stage` holds all scenes stacked on top of each other. `#track` contains empty spacer divs (one "beat" per scene) that only create scroll length.
- Each scene gets one GSAP timeline driven by one ScrollTrigger (`start: top bottom`, `end: bottom top`). The timeline has three parts: enter (first 100 vh, cross-fade and dolly in from the previous scene), main (the scene's story, one unit per text step) and exit (last 100 vh, fly-through zoom). Adjacent beats overlap exactly by 100 vh, so exit and the next enter run together.
- Depth: layers in `scenes.js` carry a `depth` from -1 (far) to 1 (near). The same camera move scales and shifts each layer by its depth, which creates the parallax. The transformer tunnel uses CSS 3D (`perspective` + `translateZ`), the embedding space a small 2D-canvas projection. No Three.js: nothing here needs a real 3D renderer.
- Reduced motion (OS setting) or the "Animation: aus" button switches to a static, linear document with all steps visible and the final state of every diagram. The button overrides the OS setting in both directions (`localStorage` key `aix-motion`).
- Language: `?lang=de|en`, else `localStorage` `aix-lang`, else the Lernhub setting (`lernhub-tweaks.lang`), else the browser language.

## Files

| File | Role |
|------|------|
| `index.html` | Scene markup (diagram skeletons, text slots) |
| `theme.css` | Art direction tokens: colors, fonts, glow. Restyle here. |
| `style.css` | Layout and components |
| `scenes.js` | Scene manifest: beat length, accent color, background layers, camera move |
| `assets/*.svg` | Scene layers (sky, hills, clouds, grid, glyphs, …) |
| `content.js` | All visible text, DE and EN |
| `model-data.js` | Demo numbers: tokens, IDs, embedding points, attention head rules, logits, tool payloads |
| `widgets.js` | Builds the data-driven widgets and their interaction (no scroll logic) |
| `story.js` | Per-scene choreography on the scrubbed timeline |
| `engine.js` | i18n, layer injection, scroll track, enter/exit camera, chapter nav |
| `vendor/` | GSAP 3.13.0 + ScrollTrigger, vendored (no CDN at runtime) |

## Replacing or adding art

- Swap an SVG in `assets/` or point a layer in `scenes.js` at a new file. Layers are drawn with `object-fit: cover` on a box 24 % larger than the stage, so leave room at the edges for the camera moves. `fit: "bottom"` anchors ground layers.
- Keep the centre-right area (desktop) or the upper half (phone) calm: the diagrams sit there. `front: true` layers sit in front of the diagram; keep them sparse.
- Do not put a double hyphen inside SVG/XML comments (invalid XML, the browser shows nothing).
- New scene: add a `<section class="scene" data-scene="id">` in `index.html` (same inner structure as the others), an entry in `scenes.js`, texts in `content.js` (including `chapters`), and optionally `A.story.id.main()` in `story.js`.

## Accuracy notes

Token IDs, vector values, attention raw scores and logits are made up for illustration (stated on the page). The computations (softmax with causal mask per attention row, softmax with temperature, sampling) are real and run live. GPT-3 sizes (96 layers, d_model 12 288) are from Brown et al. (2020), arXiv:2005.14165.

## Local preview

`npm run dev` and open `/pages/how-ai-works/index.html`, or serve `public/` with any static server. Plain `file://` also works (classic scripts, no fetch), except that browsers may block Google Fonts there.
