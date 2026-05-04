---
name: pages.js walkthrough
description: Plain-English explanation of the PANELS data file and subject color map
type: reference
---

## What Changed
**2026-05-04** — Added 6 new entries to PANELS: four "AI für Kinder" courses (ChatGPT and Claude versions in DE + EN) and two "Games" entries (Valorant-style shooter and classic shooter). Added "AI für Kinder" and "Games" to SUBJECT_COLORS.

---

## What This File Does
This file is the single source of truth for every learning card shown on the Lernhub homepage. If you want a page to appear on the hub, you add one entry here. Nothing else needs touching (except the matching HTML file in `public/pages/`).

---

## The Big Picture
Think of it like a library catalogue. Each entry is one "book record" — it holds the title, subject shelf, file location, language, and a short blurb. The homepage reads this catalogue and builds the cards automatically.

---

## Section-by-Section Walkthrough

#### The PANELS array
**What it does:** A list of objects, one per learning page. Each object describes a card: which file to open, which subject it belongs to, its title in German and English, and a short description.

**Why it exists:** Centralising all page metadata here means you add a page in exactly one place. No template to edit, no component to update.

**To change it:** To add a page, copy any existing entry and adjust the fields. `id` must be unique (lowercase, hyphens). `file` and `href` must match the filename in `public/pages/` exactly — capitalisation matters.

#### apiNeeded flag
**What it does:** When set to `true`, the card shows an "API" badge warning the user that an API key is required.

**Why it exists:** Some pages (Fabulator, PythonExplainer) call external AI APIs and won't work without a key. The badge sets expectations.

**To change it:** Add `apiNeeded: true` to any entry that needs it. Omit it (or set `false`) otherwise.

#### Legacy PAGES export
**What it does:** Converts PANELS into a simpler flat format for any old code that still imports `PAGES`.

**Why it exists:** Backwards compatibility — the hub was refactored but some imports weren't updated. Safe to ignore.

#### SUBJECT_COLORS map
**What it does:** Maps each subject name to three CSS variable references (background, text colour, border) used to colour the subject tag on each card.

**Why it exists:** Card components look up the subject name here to get the right colour without hardcoding hex values. The actual colour values live in `globals.css` as CSS variables.

**To change it:** When adding a new subject, add an entry here using `var(--tag-X-bg/text/border)` references, and add the matching CSS variables to `globals.css`.

---

## Things to Know
- `id` values are used as React keys — duplicates will cause silent rendering bugs.
- `file` and `href` are case-sensitive on Linux/Vercel. If the card shows but the link 404s, check the capitalisation.
- New subjects need a matching entry in `lib/subjects.js` (order + metadata) and CSS variables in `globals.css`, otherwise the tag renders without colour.
- "AI für Kinder" contains a special character (ü). The string must match exactly everywhere it appears — in `PANELS`, `SUBJECT_COLORS`, `SUBJECT_ORDER`, and `SUBJECT_META`.
