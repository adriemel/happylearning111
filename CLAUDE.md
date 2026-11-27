# HappyLearning — Lernhub

## Purpose
Personal learning hub for interactive HTML pages covering school subjects (Physik, Chemie, Mathematik, Deutsch) and general topics. Landing page at the root shows cards grouped by subject; each card opens the full HTML page in a new tab.

## Git & Deployment
- **GitHub repo:** `github.com/adriemel/happylearning111`
- **Deployed on:** Vercel (connected to `happylearning111`, auto-deploys on every push to `main`)
- Push workflow: `git add -A && git commit -m "..." && git push`

## Adding a New HTML Page
Two steps only:

1. Drop the `.html` file into `/public/pages/`
2. Add one entry to the `PANELS` array in `/lib/pages.js`:

```js
{
  id: "short-unique-id",          // lowercase, no spaces, used as React key
  subject: "Physik",              // one of: Mathematik | Physik | Chemie | Biologie | Erdkunde | Deutsch | Englisch | Musik | Allgemein | AI für Kinder | Games
  file: "filename.html",          // must match the file in /public/pages/ exactly
  href: "/pages/filename.html",   // same as file, prefixed with /pages/
  lang: "DE",                     // language of the target page: "DE" or "EN"
  addedAt: "2026-09-16",           // first publication date, YYYY-MM-DD; keep unchanged on edits
  apiNeeded: false,               // set true if the page requires an API key (shows "API" badge)
  title: {
    de: "Deutscher Titel",
    en: "English Title",
  },
  desc: {
    de: "Eine Satz Beschreibung auf Deutsch.",
    en: "One sentence description in English.",
  },
}
```

That's it — the card appears automatically in the correct subject section with the right tag color, language badge, and bilingual text.

The homepage shows the three newest dated entries above a collapsed topic library. Keep `addedAt` unchanged when updating a page; it means first publication, not last edit. Existing dates were backfilled from the first catalog registration in Git history. Undated entries remain discoverable in their topic and search but are excluded from Recently added.

Topics sort alphabetically by the current DE/EN display name. "Deine Themen" has two views, toggled with `Raum | Liste` in its header (the `view` tweak): **Raum** shows the 3D classroom ring (`ClassroomRing`, one board per subject), **Liste** the accordion, where only one topic opens at a time. The library reveals 12 topics at a time, each topic reveals 6 pages at a time, and global search and the additions archive reveal 12 pages at a time. Search covers the whole catalog, including collapsed or not-yet-shown topics. The palette is a midnight-blue dark theme with neon subject colors (retuned 2026-11 so that no two subjects look alike); see Design System.

### Adding a new subject
If the subject doesn't exist yet, also:
- Add it to `SUBJECT_ORDER` in `/lib/subjects.js`
- Add a metadata entry to `SUBJECT_META` in `/lib/subjects.js` (de/en name + blurb)
- Add CSS color tokens to the `:root` block in `globals.css` (`--tag-X-bg`, `--tag-X-text`, `--tag-X-border`)
- Add a `[data-subject="X"] .subject-tag { ... }` binding in `globals.css`

The classroom ring needs nothing extra: the board, its dot and the ring radius follow from `PANELS` automatically, and board/dot colors reuse the `.subject-tag` binding. Optionally add an icon for the subject in `components/SubjectIcon.jsx` (paste the inner SVG of a Lucide icon from lucide.dev); without one the board shows a generic book icon.

## Project Structure
```
HappyLearning/
├── app/
│   ├── layout.js               # Root layout — next/font fonts loaded here
│   ├── page.js                 # Thin server component — renders <LernhubApp />
│   └── globals.css             # All styles and design tokens (CSS vars)
├── components/
│   ├── LernhubApp.jsx          # "use client" root — all state (search, lang, tweaks, filtering)
│   ├── TopBar.jsx              # Sticky top bar: brand, search (⌘K / /), lang toggle, tweaks btn
│   ├── Hero.jsx                # Badge + title row ("Lern" + ParticleTitle-wrapped .title-hub + StickFigure) + subtitle + divider
│   ├── StickFigure.jsx         # Waving stick figure SVG — do NOT merge the two nested <g>s
│   ├── ParticleTitle.jsx       # "use client" one-time canvas particle intro for "hub" (vortex spiral, ~3.7 s; module flag, skips on reduced motion)
│   ├── SubjectNav.jsx          # Legacy chip bar (not used by the homepage)
│   ├── Section.jsx             # Accessible collapsible topic + batched card grid
│   ├── PageCard.js             # Card: subject tag, lang badge, title, desc, Öffnen/Open, API badge
│   ├── Tweaks.jsx              # Floating panel: density (Compact/Cozy/Spacious) + descriptions on/off
│   ├── ClassroomRing.jsx       # "use client" Raum view: CSS 3D ring of subject boards, zoom (GSAP, lazy import), room parallax
│   ├── classroom.css           # Styles for ClassroomRing (imported by it) + the view toggle placement
│   ├── SubjectIcon.jsx         # Inline Lucide SVG icon per subject for the classroom boards (ISC license notice inside)
│   └── hooks/
│       ├── useTweaks.js        # Reads/writes localStorage "lernhub-tweaks"; defaults cozy/show/de, view by motion preference
│       └── useSearch.js        # ⌘K / / / Escape keyboard shortcuts for the search input
├── lib/
│   ├── pages.js                # SOURCE OF TRUTH — PANELS array + legacy PAGES + SUBJECT_COLORS
│   ├── subjects.js             # SUBJECT_ORDER + SUBJECT_META (de/en names + blurbs)
│   └── i18n.js                 # T dictionary — all UI strings in de + en
├── public/
│   ├── pages/                  # Raw HTML files — never touch these when adding a new page
│   └── scenes/classroom/       # Room art for ClassroomRing: wall/floor/window/desks.svg + scene.json
├── next.config.mjs
└── package.json
```

## Design System
- **Fonts:** Instrument Serif (title/card titles) · Syne (UI/body) · DM Mono (tags/labels/mono)
- **Key colors:** `#0c0b1c` bg (midnight) · `#12112a` card · `#181736` card hover · `#15142f` elevated · `#272548` border · `#e4ddd4` text · `#b5f23d` lime accent (the single UI accent)
- **Subject tag colors:** Mathematik `#ff8a2e` · Physik `#5b8cff` · Chemie `#5ddc95` · Biologie `#c9954a` · Erdkunde `#2fb0c9` · Deutsch `#c77dff` · Englisch `#f5e642` · Musik `#ff6b9d` · Allgemein `#b8c7d9` · AI für Kinder `#9ff3ff` · Games `#ff4f38`
- Each subject has `--tag-X-text` plus `--tag-X-bg` / `--tag-X-border` (same RGB at 0.10 / 0.30 alpha). Every text color keeps ≥ 5.9:1 contrast on `--bg` (lowest: Games 5.95, Physik 6.15). The sticky top bar uses `--bg` as `rgba(12, 11, 28, 0.82)`; keep it in sync if `--bg` changes.
- **CSS variables** defined in `:root` in `globals.css` — change there to retheme
- Dark theme throughout; cards lift on hover with lime border glow
- `data-density` on `<html>` drives grid columns + card padding (set by `LernhubApp` via `useEffect`)
- `data-descriptions` on `<html>` shows/hides `.card-desc` globally

## Tweaks panel (localStorage key: `lernhub-tweaks`)
Persists `{ density: "cozy", descriptions: "show", lang: "de", view: null }`. Toggled from the top bar; `view` is set by the `Raum | Liste` toggle in the "Deine Themen" header.
- **view** — `"room"` or `"list"`. While unset (`null`) it defaults to `"room"`, or `"list"` when `prefers-reduced-motion: reduce` matches; the derived default is not persisted. While the search field is non-empty, search results replace both views.
- **Compact** — 4 cols, hides desc + footer
- **Cozy** — 3 cols (default)
- **Spacious** — 3 cols with more gap/padding

## Classroom ring (`ClassroomRing.jsx`)
- Plain DOM + CSS 3D: stage has `perspective: R`, ring sits at `translateZ(R)` (viewer in the room centre) and rotates by `pos × 360/N`; board `i` is at `rotateY(-i·step) translateZ(-R)` with `R = W·(1 + BOARD_GAP) / (2·tan(π/N))`; `BOARD_GAP` (0.22) leaves a gap between neighbours (0 = they touch). The active board has a backlight glow in its subject color (opacity fade only). Board layout ("poster"): centred icon halo (`SubjectIcon`), large subject title, blurb, page-count pill (no page titles; they appear after zooming in); no visible button: an invisible full-board button (`.board-open`, aria-label "Öffnen: …") makes the whole front board the tap/click/Enter target. Sizes scale with the board width. `pos` is unwrapped (last → first is one step). W/H are recomputed from the stage size (ResizeObserver).
- Rotation is a CSS transition only (no per-frame JS); drag writes one CSS variable (`--drag`) per animation frame. Room layers are rebased by whole tiles after each move (on `transitionend`, with a 700 ms timer fallback); every layer, including front layers, must keep its `transform` transition or the rebase is skipped and the layer drifts off the stage. Board titles shrink to fit their longest word (`--title-em`, from `TITLE_EM_PER_CHAR`) and never break inside a word. Visibility by circular distance: 1 / 0.8 / 0.3, further boards are `inert` + `aria-hidden`. Never shows boards at ≥ 90°.
- Zoom (tap/Enter on the front board): GSAP `import("gsap")` on demand moves the camera (`translateZ` + slight scale), the board grows to show the full page list; Esc or "Zurück" zooms out. Reduced motion: no transitions, zoom is instant.
- Keyboard: Tab to the front board (invisible "Öffnen" button), ←/→ rotate, Enter zooms, Esc back; the A–Z dot strip follows in Tab order. `aria-live` announces the active subject.

### Replacing the room
Everything lives in `public/scenes/classroom/`; no code change needed:
- Replace or add SVG layers. Each layer is scaled to its height and repeated horizontally, so its left and right edges must tile. Do not put `--` inside SVG/XML comments (invalid XML, the browser then shows nothing).
- Edit `scene.json`: per layer `file`, `z` (draw order; `z > ringZ` = in front of the boards, faded out while zoomed), `parallax` (px shift per degree of ring rotation), `tileAspect` (SVG width / height), and `top` / `bottom` / `height` (CSS lengths in the stage). `tokens` documents which palette colors the art uses.
- Keep the horizon below the front board (~77 % of the stage height) and front layers below ~76 %, or they cover the board.

## HTML Files
All 25 HTML files are fully self-contained (inline CSS/JS, some use Google Fonts CDN). No local assets.

| File | DE Title | Subject | Lang | API |
|------|----------|---------|------|-----|
| BrownMovement.html | Brownsche Molekularbewegung | Chemie | DE | |
| schatten_v2.html | Licht & Schatten | Physik | DE | |
| bruchrechnung-v5.html | Bruchrechnung | Mathematik | DE | |
| mondphasen.html | Mondphasen | Physik | DE | |
| trennverfahren-labor.html | Trennverfahren-Labor | Chemie | DE | |
| stoffgemische-labor.html | Heterogene Stoffgemische | Chemie | DE | |
| quiz-Chemie.html | Quiz: Chemie-Klassenarbeit | Chemie | DE | |
| pflanzenzelle-fotosynthese.html | Pflanzenzelle & Fotosynthese | Biologie | DE | |
| wetter-klima.html | Wetter & Klima Kompass | Erdkunde | DE | |
| wind-passat.html | Winde & Passat | Erdkunde | DE | |
| Fabulator.html | Fabulator | Deutsch | DE | ✓ |
| pangaea_ai_training_wiki.html | KI-Training & Pangaea | Allgemein | EN | |
| html-lernen.html | HTML Lernen | Allgemein | DE | |
| PythonExplainer.html | Python Explainer | Allgemein | EN | ✓ |
| my-day-planner.html | My Day Planner | Allgemein | DE | |
| CalCom.html | CalCom Kalorientabelle | Allgemein | DE | |
| AI_course_kids_ChatGPT_de.html | KI-Grundlagen für Kinder | AI für Kinder | DE | |
| AI_course_kids_ChatGPT_en.html | KI-Grundlagen für Kinder | AI für Kinder | EN | |
| AI_course_kids_Claude_de.html | KI für junge Wissenschaftler | AI für Kinder | DE | |
| AI_course_kids_Claude_en.html | KI für junge Wissenschaftler | AI für Kinder | EN | |
| musik-orchester1.html | Musik-Lernen: Orchester, Chor & Ukulele | Musik | DE | |
| musik-orchester2.html | Musik-Training: Orchester, Chor & Ukulele | Musik | DE | |
| valorant-shooter.html | Taktik-Shooter | Games | EN | |
| basic-shooter.html | Klassischer Shooter | Games | EN | |
| english-grammar-gym-7.html | Grammar Gym: Englisch Klasse 7 | Englisch | EN | |

Multi-file pages live in their own folder under `/public/pages/` with a README (`file`/`href` point to the folder's `index.html`):
- `backrooms/` — Vocab Escape (Games, DE), vendored Three.js.
- `how-ai-works/` — Wie KI denkt (listed twice: Allgemein with `addedAt`, AI für Kinder without, so Recently added shows it once; DE/EN toggle; catalog `lang` is "DE"). Synthwave z-axis flight: scrolling moves a camera forward through stations (GSAP + ScrollTrigger, vendored). Art (`assets/*.svg` + `scenes.js`), text (`content.js`), demo numbers (`model-data.js`) and animation logic (`engine.js`, `story.js`, `widgets.js`) are separate; see its README before editing.

## Notes
- `npm run dev` to run locally at `localhost:3000`
- `npm run build` to verify before pushing
- The stick figure SVG in `StickFigure.jsx` uses two nested `<g>` elements for the waving arm — outer `<g>` has the SVG `transform="translate(...)"`, inner `<g>` has the CSS `wave-arm` animation. Never merge them or the animation breaks.
- `Hero.jsx` and `SubjectNav.jsx` are not marked `"use client"` — they're used inside `LernhubApp.jsx` which is already a client component, so they inherit that context.
