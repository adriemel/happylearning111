# Lernhub v2 — Handoff for Claude Code

This document describes the redesign of the Lernhub homepage. The goal is to port this design into the existing Next.js app at `github.com/adriemel/happylearning111` without breaking the existing `public/pages/*.html` links.

**Reference files in this project:**
- `Lernhub Redesign.html` — the full working prototype (single-file React via Babel, all logic + styles inline). Use this as the source of truth for visuals, behaviour, and copy.

## What changes vs. v1

The v1 homepage is a single flat `PAGES.map(...)` grid. It won't scale past ~15 items. v2 keeps the exact same visual language (dark workshop, neon lime `#b5f23d`, Instrument Serif + Syne + DM Mono, waving stick figure, noise/gradient background) and restructures the page for scale:

1. **Sticky top bar** with the mini-brand, a **search** input (⌘K / `/` shortcut, Escape clears), **DE/EN language toggle**, and a **Tweaks** icon button.
2. **Hero** is unchanged in spirit — badge, `Lern` (serif italic lime) + `hub` (sans bold), stick figure waving next to it, subtitle, lime divider.
3. **Sticky subject nav** — horizontal chips for `Alle / Mathematik / Physik / Chemie / Deutsch / Allgemein`, each with a count. Active chip is solid lime with a glow. Scrolls horizontally on mobile.
4. **Subject sections** — cards are grouped by subject under italic serif section headers (`Mathematik · 03 Seiten`) with a mono blurb on the right. The old flat grid is gone.
5. **Cards** keep the v1 anatomy (colored subject tag, serif title, sans description, mono `Öffnen →` footer, lime hover glow) and add a small `DE`/`EN` language badge in the top-right plus an optional `API` badge in the footer.
6. **Tweaks panel** (bottom-right, toggled from the top bar): density (Compact / Cozy / Spacious), descriptions on/off, plus the language toggle is already in the top bar. Persists to `localStorage` under key `lernhub-tweaks`.
7. **i18n** — every card has `title: {de, en}` and `desc: {de, en}`. Subject names also translate. The toggle updates the whole UI including subject chips and section headers.

Nothing about the existing `/pages/*.html` links changes — cards still point to the same `href`s.

## Palette / tokens

Keep the exact `globals.css` root tokens from v1 (`--bg`, `--bg-card`, `--bg-card-h`, `--border`, `--border-h`, `--text-primary`, `--text-secondary`, `--text-muted`, `--lime`, `--lime-dim`, `--lime-glow`). Add five subject-tag color triples (bg / text / border), translucent on dark:

- **Mathematik**: `#ffb02e` (amber)
- **Physik**: `#8e9dff` (periwinkle)
- **Chemie**: `#5ddc95` (mint)
- **Deutsch**: `#de7bcc` (magenta)
- **Allgemein**: `#b398ff` (lilac)

These match the v1 `subject-tag` pattern but extend it consistently to all five subjects.

## Fonts

Already wired via `next/font` in v1. No change:
- `Syne` → `--font-sans`
- `Instrument Serif` → `--font-serif`
- `DM Mono` → `--font-mono`

## Data model

Extend `lib/pages.js` so each page is:

```js
{
  id: "brown",
  subject: "Chemie",                // one of: Mathematik | Physik | Chemie | Deutsch | Allgemein
  file: "BrownMovement.html",       // existing
  href: "/pages/BrownMovement.html",
  lang: "DE",                        // language of the target page: "DE" | "EN"
  apiNeeded: false,                  // optional
  title: {
    de: "Brownsche Molekularbewegung",
    en: "Brownian Motion",
  },
  desc: {
    de: "Interaktive Simulation der zufälligen Bewegung von Teilchen in der Luft.",
    en: "Interactive simulation of random particle motion in air.",
  },
}
```

All ten current pages with full DE/EN copy are already written out in `Lernhub Redesign.html` (the `PANELS` array near the top of the inline `<script type="text/babel">`). Copy verbatim.

## Component structure (suggested)

```
app/
  layout.js           // keep
  page.js             // rewrite to compose: <TopBar/> <Hero/> <SubjectNav/> <Sections/> <Footer/> <Tweaks/>
components/
  TopBar.jsx          // brand + Search + LangToggle + TweaksButton
  Hero.jsx            // badge + title-row (with StickFigure) + sub + divider
  StickFigure.jsx     // unchanged SVG from v1, extracted
  SubjectNav.jsx      // sticky chips; props: subjects, counts, active, onSelect, lang
  Section.jsx         // one subject section: header + grid of PageCard
  PageCard.jsx        // extend v1 to show lang badge + apiNeeded badge, use page.title[lang] / page.desc[lang]
  Tweaks.jsx          // floating panel; props: open, tweaks, set, lang
  hooks/
    useTweaks.js      // reads/writes localStorage "lernhub-tweaks"; defaults { density: "cozy", descriptions: "show", lang: "de" }
    useSearch.js      // ⌘K / / / Escape shortcuts
lib/
  pages.js            // extended schema above
  i18n.js             // the T[de|en] dictionary from the prototype
  subjects.js         // SUBJECT_ORDER + SUBJECT_META (de/en names, blurbs)
```

All styles live in `app/globals.css` — just append to the existing file, don't replace. Every class used in the prototype is already namespaced (`.topbar`, `.chip`, `.subject-section`, `.tweaks`, etc.) and won't collide with v1 classes.

## Behaviour

- Language toggle updates `document.documentElement.lang` and every translatable string. Persist to `localStorage`.
- Search filters across `title[lang]`, `desc[lang]`, and the localized subject name. Empty subject sections are hidden from the render.
- Subject chip click sets `activeSubject`; `Alle/All` resets it. Filtering by chip AND search both apply.
- Density `compact` switches the grid to 4 cols (≥1000px) and hides descriptions + the card footer — gives you a dense index view when the list is long.
- Density `spacious` stays at 3 cols but with more padding.
- Empty state when search yields nothing: dashed-border card with `∅` mark and a "try another term" message.

## Responsive breakpoints

- `≥1000px`: 3 cols (or 4 in compact).
- `560–999px`: 2 cols, search stays in the top bar.
- `<560px`: 1 col. Subject chips become a horizontal scroller. Top bar wraps the search below the brand if needed.

## Accessibility

- Stick-figure SVG is `aria-hidden`.
- Language toggle is a `role="group"` with two buttons; the active one has `.on`.
- Chips and icon buttons have `title` attributes; `aria-pressed` on the Tweaks toggle.
- Cards are `<a>` elements with real `href`s — no JS needed to navigate.

## What NOT to change

- Don't touch `public/pages/*.html` — those are the actual learning apps.
- Keep the stick-figure SVG exactly as-is (markup + wave-arm / figure-bounce keyframes).
- Keep the existing `globals.css` root tokens.
- The `v2.0` badge in the hero is the only version bump.

## Open questions for the user

- Should the language toggle also switch subtitles/copy INSIDE each learning page, or only on the hub? (Current assumption: only on the hub.)
- Do we want to persist "last selected subject" across reloads? (Currently not persisted — it resets to `Alle` on reload, which feels right for a hub.)
- Add a "recently opened" row at the top once there are 30+ pages? (Not included in v2, but the layout reserves space for it between Hero and SubjectNav.)
