---
name: subjects.js walkthrough
description: Plain-English explanation of the subject order and metadata file
type: reference
---

## What Changed
**2026-05-04** — Added "AI für Kinder" and "Games" to SUBJECT_ORDER and SUBJECT_META. Both new subjects appear after "Allgemein" in the navigation.

---

## What This File Does
This file controls which subject categories exist on the hub, what order they appear in, and what label and tagline each one displays. Add a new subject here and it shows up in the navigation bar and as a section heading.

---

## Section-by-Section Walkthrough

#### SUBJECT_ORDER
**What it does:** A simple list of subject names in the exact order they should appear — left to right in the nav chip bar, and top to bottom in the card grid.

**Why it exists:** Without an explicit order, sections would appear in unpredictable sequence. This list is the single control for that sequence.

**To change it:** Move, add, or remove a string to reorder or introduce a subject. The string must match the `subject` field used in `pages.js` entries exactly.

#### SUBJECT_META
**What it does:** For each subject, stores the display name in German (`de`) and English (`en`), plus a short tagline (`blurb`) shown under the section heading.

**Why it exists:** The hub is bilingual. When the user switches language, the section headers and nav chips update — this object supplies both versions.

**To change it:** Edit the `de`/`en` strings to rename how a subject appears in the UI. Update `blurb.de` and `blurb.en` to change the tagline under each section heading.

---

## Things to Know
- Every subject name in `SUBJECT_ORDER` must also have a matching key in `SUBJECT_META` — missing metadata will crash the section render.
- The subject name strings here must match exactly what's used in `pages.js` (PANELS entries and SUBJECT_COLORS). A typo in one place means cards silently fall through or a section appears empty.
- "AI für Kinder" uses a special character (ü). Copy-paste rather than re-type if you need to reference it elsewhere.
