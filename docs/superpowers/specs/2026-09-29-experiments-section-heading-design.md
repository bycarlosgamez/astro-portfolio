# Experiments section heading & sidebar label — design spec

**Status:** Implemented  
**Date:** 2026-09-29  

## Summary

Restore a **numbered section `h1`** on the experiments index (parity with projects). Move the **active experiment name** to a dynamic **`h2`**. Restyle the **sidebar panel label** so it is not numbered and does not read as a nav link.

## Page heading (experiments index)

- **`h1.numbered-title`:** `<span aria-hidden="true">01</span>Selected experiments` — muted index via existing `.numbered-title > span:first-child`, label full white.
- **`h2`:** Active experiment title; server-rendered default; client updates on sidebar select and `?exp=` (`id="experiment-active-title"`, optional `aria-live="polite"`).
- **`document.title`:** Unchanged — `Carlos Gamez | {experiment title}`.
- **`ExperimentPreview`:** Keeps `showTitle={false}` to avoid triple repetition.

## Sidebar label

- Copy: **Pick an experiment** (no `01`).
- Remove `numbered-title` / `numbered-title--compact` from sidebar header.
- Style as **section label:** mono or small type, ~40–45% white (`color-light` or equivalent), no link/button hover, no left border, smaller than `.experiment-sidebar__link`.

## Non-goals

- Changing `/experiments/all` numbered `h1`.
- Changing main nav numbering.

## Files

| File | Change |
|------|--------|
| `src/pages/experiments/index.astro` | `h1` + `h2` markup; JS targets `h2` |
| `src/components/ExperimentSidebar.astro` | Header markup + `.experiment-sidebar__header` styles |

## Verification

- Section `h1` static on all selections; `h2` updates when picking sidebar items and on back/forward.
- Sidebar header visually distinct from list links.
- Heading order: one `h1`, one visible `h2` per state.
