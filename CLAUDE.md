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
  subject: "Physik",              // one of: Mathematik | Physik | Chemie | Deutsch | Allgemein
  file: "filename.html",          // must match the file in /public/pages/ exactly
  href: "/pages/filename.html",   // same as file, prefixed with /pages/
  lang: "DE",                     // language of the target page: "DE" or "EN"
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

### Adding a new subject
If the subject doesn't exist yet, also:
- Add it to `SUBJECT_ORDER` in `/lib/subjects.js`
- Add a metadata entry to `SUBJECT_META` in `/lib/subjects.js` (de/en name + blurb)
- Add CSS color tokens to the `:root` block in `globals.css` (`--tag-X-bg`, `--tag-X-text`, `--tag-X-border`)
- Add a `[data-subject="X"] .subject-tag { ... }` binding in `globals.css`

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
│   ├── Hero.jsx                # Badge + title row (with StickFigure) + subtitle + divider
│   ├── StickFigure.jsx         # Waving stick figure SVG — do NOT merge the two nested <g>s
│   ├── SubjectNav.jsx          # Sticky chip bar: Alle / subjects with counts
│   ├── Section.jsx             # One subject section: italic header + card grid
│   ├── PageCard.js             # Card: subject tag, lang badge, title, desc, Öffnen/Open, API badge
│   ├── Tweaks.jsx              # Floating panel: density (Compact/Cozy/Spacious) + descriptions on/off
│   └── hooks/
│       ├── useTweaks.js        # Reads/writes localStorage "lernhub-tweaks"; defaults cozy/show/de
│       └── useSearch.js        # ⌘K / / / Escape keyboard shortcuts for the search input
├── lib/
│   ├── pages.js                # SOURCE OF TRUTH — PANELS array + legacy PAGES + SUBJECT_COLORS
│   ├── subjects.js             # SUBJECT_ORDER + SUBJECT_META (de/en names + blurbs)
│   └── i18n.js                 # T dictionary — all UI strings in de + en
├── public/
│   └── pages/                  # Raw HTML files — never touch these when adding a new page
├── next.config.mjs
└── package.json
```

## Design System
- **Fonts:** Instrument Serif (title/card titles) · Syne (UI/body) · DM Mono (tags/labels/mono)
- **Key colors:** `#0b0c0f` bg · `#e4ddd4` text · `#b5f23d` lime accent
- **Subject tag colors:** Mathematik `#ffb02e` · Physik `#8e9dff` · Chemie `#5ddc95` · Deutsch `#de7bcc` · Allgemein `#b398ff`
- **CSS variables** defined in `:root` in `globals.css` — change there to retheme
- Dark theme throughout; cards lift on hover with lime border glow
- `data-density` on `<html>` drives grid columns + card padding (set by `LernhubApp` via `useEffect`)
- `data-descriptions` on `<html>` shows/hides `.card-desc` globally

## Tweaks panel (localStorage key: `lernhub-tweaks`)
Persists `{ density: "cozy", descriptions: "show", lang: "de" }`. Toggled from the top bar.
- **Compact** — 4 cols, hides desc + footer
- **Cozy** — 3 cols (default)
- **Spacious** — 3 cols with more gap/padding

## HTML Files
All 10 HTML files are fully self-contained (inline CSS/JS, some use Google Fonts CDN). No local assets.

| File | DE Title | Subject | Lang | API |
|------|----------|---------|------|-----|
| BrownMovement.html | Brownsche Molekularbewegung | Chemie | DE | |
| schatten_v2.html | Licht & Schatten | Physik | DE | |
| bruchrechnung-v5.html | Bruchrechnung | Mathematik | DE | |
| mondphasen.html | Mondphasen | Physik | DE | |
| stoffgemische-labor.html | Heterogene Stoffgemische | Chemie | DE | |
| Fabulator.html | Fabulator | Deutsch | DE | ✓ |
| pangaea_ai_training_wiki.html | KI-Training & Pangaea | Allgemein | EN | |
| html-lernen.html | HTML Lernen | Allgemein | DE | |
| PythonExplainer.html | Python Explainer | Allgemein | EN | ✓ |
| my-day-planner.html | My Day Planner | Allgemein | DE | |

## Notes
- `npm run dev` to run locally at `localhost:3000`
- `npm run build` to verify before pushing
- The stick figure SVG in `StickFigure.jsx` uses two nested `<g>` elements for the waving arm — outer `<g>` has the SVG `transform="translate(...)"`, inner `<g>` has the CSS `wave-arm` animation. Never merge them or the animation breaks.
- `Hero.jsx` and `SubjectNav.jsx` are not marked `"use client"` — they're used inside `LernhubApp.jsx` which is already a client component, so they inherit that context.
