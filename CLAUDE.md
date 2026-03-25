# HappyLearning — Lernhub

## Purpose
Personal learning hub for interactive HTML pages covering school subjects (Physik, Chemie, Mathematik, Deutsch) and general topics. Landing page at the root shows a card grid; each card opens the full HTML page in a new tab.

## Git & Deployment
- **GitHub repo:** `github.com/adriemel/happylearning111`
- **Deployed on:** Vercel (connected to `happylearning111`, auto-deploys on every push to `main`)
- Push workflow: `git add -A && git commit -m "..." && git push`

## Adding a New HTML Page
Two steps only:

1. Drop the `.html` file into `/public/pages/`
2. Add one entry to `/lib/pages.js`:

```js
{
  file: "filename.html",        // must match exactly
  title: "Displayed Title",
  subject: "Physik",            // see subject list below
  description: "One sentence describing the page.",
}
```

Valid subjects (each has its own tag color): `Physik`, `Chemie`, `Mathematik`, `Deutsch`, `Allgemein`
To add a new subject, also add a color entry to `SUBJECT_COLORS` at the bottom of `/lib/pages.js`.

## Project Structure
```
HappyLearning/
├── app/
│   ├── layout.js      # Root layout — Google Fonts loaded here
│   ├── page.js        # Landing page (hero + card grid + stick figure)
│   └── globals.css    # All styles and design tokens (CSS vars)
├── components/
│   └── PageCard.js    # Card component — reads subject color from lib/pages.js
├── lib/
│   └── pages.js       # SOURCE OF TRUTH for all pages — edit here to add/remove/change cards
├── public/
│   └── pages/         # HTML files served as raw static files at /pages/filename.html
├── next.config.mjs
└── package.json
```

## Design System
- **Fonts:** Instrument Serif (title script) · Syne (UI) · DM Mono (tags/labels)
- **Key colors:** `#0b0c0f` bg · `#e4ddd4` text · `#b5f23d` lime accent
- **CSS variables** are defined at the top of `globals.css` — change them there to retheme
- Dark theme throughout; cards highlight with a lime border glow on hover

## HTML Files
All 8 HTML files are fully self-contained (inline CSS/JS, some use Google Fonts CDN). No local assets — just drop and register.

| File | Title | Subject |
|------|-------|---------|
| BrownMovement.html | Brownsche Molekularbewegung | Chemie |
| schatten_v2.html | Licht & Schatten | Physik |
| bruchrechnung-v5.html | Bruchrechnung | Mathematik |
| mondphasen.html | Mondphasen | Physik |
| stoffgemische-labor.html | Heterogene Stoffgemische | Chemie |
| Fabulator.html | Fabulator | Deutsch |
| pangaea_ai_training_wiki.html | KI-Training & Pangaea | Allgemein |
| html-lernen.html | HTML Lernen | Allgemein |

## Notes
- `npm run dev` to run locally at `localhost:3000`
- `npm run build` to verify before pushing
- The stick figure SVG in `page.js` uses two nested `<g>` elements for the waving arm — one for translate (SVG attr), one for CSS animation. Do not merge them onto a single element or the animation breaks.
