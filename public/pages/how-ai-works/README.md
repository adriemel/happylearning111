# Wie KI denkt · How AI thinks

Scrollytelling page (DE/EN toggle) for teens and curious adults. It follows one question ("Könnte ein Eisbär einen Pinguin fressen, wenn er in der Antarktis leben würde?" / "Could a polar bear eat a penguin if it lived on Antarctica?") into a language model: chat and harness, the LLM box (you dive into it), tokens, embedding matrix lookup, 3D meaning space, attention ("er"/"it": bear or penguin?), the layer stack, softmax and sampling, a fast-forward of the token loop, and back out to the finished answer.

## How it works

- **Scrolling flies forward.** All stations sit one behind the other on a z axis in one fixed `#world`. Native scrolling (wheel, trackpad, touch, keys) only provides distance: `#track` is an empty tall div. Nothing slides vertically; the scrollbar is hidden.
- **One timeline.** `engine.js` builds a single GSAP timeline `[dwell 0][fly][dwell 1][fly]…` scrubbed by one ScrollTrigger. During a dwell the camera barely drifts and the station's story (`story.js`) plays step by step; during a fly the camera moves to the next station and the text panels swap.
- **Projection.** `render(camZ)` scales each station and each decoration item by `perspective / (perspective + distance)` around the vanishing point (centre of the diagram area). The next station is always visible faintly in the distance. The floor/ceiling grids are CSS 3D planes whose tile offset follows the camera. Environments (`outside` synthwave landscape, `inside` the model) cross-fade during a flight; the LLM box stays opaque longer (`passFade`) so flying into it works as a portal.
- **No Three.js.** The 3D meaning space is a small 2D-canvas projection; the layer tunnel uses CSS 3D. Nothing needs a real 3D renderer.
- **Static mode.** OS reduced-motion setting or the "Animation: aus" button: a plain linear document with every step visible and the final state of each diagram. The button overrides the OS setting in both directions (`localStorage` key `aix-motion`).
- **Language.** `?lang=de|en`, else `localStorage` `aix-lang`, else the Lernhub setting (`lernhub-tweaks.lang`), else the browser language.

## Files

| File | Role |
|------|------|
| `index.html` | Station markup (diagram skeletons, text slots) |
| `theme.css` | Art direction tokens (synthwave colors, fonts, glow) |
| `style.css` | Layout and components |
| `scenes.js` | World manifest: environments (sky, sun, horizon, grid tiles, decoration), stations (order, environment, dwell length, accent), flight parameters |
| `assets/*.svg` | Environment layers, grid tiles and decoration (`synth-*`, `inside-*`, `grid-*`, `deco-*`) |
| `content.js` | All visible text, DE and EN |
| `model-data.js` | Demo numbers: tokens and IDs, attention words and head rules, embedding points, logits |
| `widgets.js` | Data-driven widgets; scroll-driven ones expose pure `render(p)` functions |
| `story.js` | Per-station choreography |
| `engine.js` | i18n, environments, decoration, flight timeline, projection, chapter nav |
| `vendor/` | GSAP 3.13.0 + ScrollTrigger, vendored (no CDN at runtime) |

## Changing the look

- Swap SVGs in `assets/` or point `scenes.js` at new files. Grid tiles are drawn at 48 px (`GRID` in `engine.js`, `.env-grid` in `style.css`).
- A new environment: add it under `envs` and set `env` on the stations that should sit in it.
- A new station: add a `<section class="station" data-station="id">` (same inner structure), an entry in `scenes.js` `stations`, texts in `content.js` (including `chapters`), and optionally `A.story.id.main()` in `story.js`.
- Do not put a double hyphen inside SVG/XML comments (invalid XML, the browser shows nothing).

## Accuracy notes

Token IDs, vectors, attention raw scores and logits are made up (stated on the page). Softmax with causal mask per attention row, softmax with temperature and sampling are computed live. Attention is shown on whole words for readability. GPT-3 sizes (96 layers, d_model 12 288) are from Brown et al. (2020), arXiv:2005.14165. The statement that feed-forward layers hold much factual knowledge is hedged ("vermutlich") and cites Geva et al. (2021).

## Local preview

`npm run dev` and open `/pages/how-ai-works/index.html`, or serve `public/` with any static server.
