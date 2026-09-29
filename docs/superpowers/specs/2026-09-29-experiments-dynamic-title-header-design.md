# Experiments dynamic title in header + content — design spec

**Branch:** `feat/content-structure-hybrid`  
**Status:** Reverted — awaiting clarified requirements  
**Date:** 2026-09-29  
**Related:** `2026-09-29-experiments-floating-sidebar-design.md`

## Summary

Remove the redundant page line **“01 Pick an experiment.”** Show the **current experiment title** in two places on `/experiments`: a **context line in the header chrome** (experiments routes only) and a single **`<h1>`** in the main column. Main site nav stays fixed (**01 Experiments** never becomes the experiment name). Preview component drops its duplicate large title.

## Goals

- Clear hierarchy: section = main nav; current item = experiment title.
- Header reinforces “what I’m viewing” while sidebar handles switching.
- One logical **`h1`** per page for accessibility and SEO.
- Title updates stay in sync with sidebar selection and `?exp=` URL.

## Non-goals

- Changing primary nav link labels to experiment names.
- Dynamic titles on Home, Projects, or About.

---

## 1. Heading hierarchy

| Element | Role |
|---------|------|
| Main nav **01 Experiments** | Site section (unchanged, always link to `/experiments`) |
| Header context line | Visual duplicate of current title; **not** an `<h1>` |
| Main **`<h1>`** | Canonical page title = current experiment title |
| `ExperimentPreview` body | Description, thumbnail, meta, links — **no** second prominent title |

**Remove:** `01 Pick an experiment` from `/experiments` index.

**Optional:** Muted **`01`** prefix before title in header and/or `h1` (section index continuity). Same styling as existing `numbered-title` span (`opacity` / color token).

---

## 2. Header context title (experiments routes)

### Visibility

- **`/experiments`** (index): show context title.
- **`/experiments/[slug]`** (demo): show same experiment title in header.
- **`/experiments/all`:** context text **All experiments** (static).

### Placement

- Inside `header-primary` on experiments layouts only.
- **Desktop:** between logo and main nav **or** full-width row below header accent line if horizontal space is tight — implementer picks one; must not replace or mimic a fifth nav item.
- **Mobile:** below logo row or above nav toggle; truncate long titles with ellipsis (`text-overflow`).

### Markup & a11y

- Context line: `<p class="experiment-header-title">` (or equivalent), **`aria-hidden="true"`** when main `h1` carries the same text.
- Alternatively: single visible `h1` in main only and header uses `aria-labelledby` pointing to `h1` — prefer **hidden decorative header + canonical `h1` in main** for simpler layout.

### Styling

- `font-condensed uppercase tracking-xl` (align with nav).
- Optional leading `<span aria-hidden="true">01</span>` with numbered-title muted style.

### Data & updates

- **Index:** SSR default title from default `exp`; client updates header + `h1` when sidebar/`?exp=` changes.
- **Demo page:** SSR title from collection entry; no client sync required unless iframe page also reacts to query (not required).

---

## 3. Main content (`/experiments` index)

- Replace static `h1` with dynamic experiment title (SSR default matches preview).
- Keep centered layout in remaining space beside floating sidebar (existing `experiment-index` rules).
- Client script: one function updates **header context text**, **`h1` text**, preview panel visibility, sidebar `aria-current`, and URL `?exp=` (existing behavior extended for title strings).

**Title source:** Pass JSON catalog `{ slug, title }[]` or read from `data-title` on preview panels to avoid drift.

---

## 4. `ExperimentPreview` component

- Add prop **`showTitle?: boolean`** (default `false` on index when `h1` is outside).
- When `showTitle` is false: omit the large mono/condensed title block.
- Demo route **`/experiments/[slug]`:** either `showTitle={false}` with `h1` in page shell, or keep preview title as `h2` under page `h1` — **one visible title only**; prefer page-level `h1` + preview without title.

---

## 5. Implementation approach

**Recommended:** `Main.astro` optional named slot **`headerContext`** rendered inside `HeaderPrimary` or immediately after logo wrapper.

- Experiments index passes initial context markup.
- Empty on other pages.
- Client selects `#experiment-header-title` and `#experiment-page-title` (or shared class) for updates.

**Avoid:** Global header reading `?exp=` on every page.

### Files (expected touch)

| File | Change |
|------|--------|
| `HeaderPrimary.astro` or `Main.astro` | Slot / region for context title |
| `experiments/index.astro` | Dynamic `h1`; remove “Pick an experiment”; extend script |
| `experiments/[slug].astro` | Context title + `h1` alignment |
| `experiments/all/index.astro` | Static “All experiments” context + `h1` |
| `ExperimentPreview.astro` | Optional hide title |

---

## 6. Edge cases

- **No experiments:** hide context title; `h1` “Experiments” or short empty state (no crash).
- **No featured / deep link non-featured:** title still updates; sidebar may show no `aria-current`.
- **Long titles:** truncate in header with `title` attribute full string on hover/focus.
- **Document `<title>`:** optional follow-up — `Carlos Gamez | {experimentTitle}` on index when `exp` set (nice-to-have, not blocking).

---

## 7. Testing

- Load `/experiments` — header and `h1` match default featured experiment.
- Click sidebar item — header, `h1`, and preview update; URL `?exp=` updates.
- Load `/experiments?exp=grid-study` — correct title (non-featured OK).
- `/experiments/token-playground` — header matches demo; one primary heading in document outline.
- `/experiments/all` — “All experiments” in header and `h1`.
- Accessibility: exactly one `h1` in main per page; nav still four items.

---

## Decisions log

| Decision | Choice |
|----------|--------|
| Nav label | Always **01 Experiments** |
| Replace “Pick an experiment” | Yes — use experiment title |
| Title placement | Header context + main `h1` (user approved both) |
| Header title element | Not `h1`; decorative / `aria-hidden` |
| Preview title | Hidden on index when `h1` is outside |
