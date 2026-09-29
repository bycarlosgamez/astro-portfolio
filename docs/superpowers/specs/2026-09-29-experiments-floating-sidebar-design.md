# Experiments floating sidebar — design spec

**Branch:** `feat/content-structure-hybrid`  
**Status:** Implemented  
**Date:** 2026-09-29  
**Depends on:** Content collections (`experiments`), `ExperimentPreview`, `/experiments?exp=`

## Summary

Replace the experiments index secondary navigation (category tabs, boxed list, tags, search) with a **left floating sidebar** that matches the **main nav visual language**. The sidebar lists **featured experiments only** (title per link). Selection updates the **preview column** and `?exp=` URL. A footer link to **all experiments** is reserved for a later masonry page (not in this phase).

## Goals

- One obvious way to switch featured experiments without category tabs or list chrome.
- Visual continuity with `HeaderPrimary` / `.nav-primary` (condensed type, glass panel, rounded corners).
- Active item: **white left border** + subtle fill — no icons or tags on the right.
- Keep preview-first behavior and text-link actions (no `button-large`).

## Non-goals (this phase)

- Masonry `/experiments/all` layout and click behavior (deferred).
- Category tabs or category-based URL params.
- Sidebar entries for non-featured experiments.

---

## 1. Page layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]                    00 Home  01 Experiments …         │
├──────────┬──────────────────────────────────────────────────┤
│ ╭──────╮ │  Optional: 01 Pick an experiment                 │
│ │sidebar│ │                                                 │
│ │      │ │              PREVIEW COLUMN                       │
│ │      │ │  ExperimentPreview (title, desc, thumb, links)    │
│ ╰──────╯ │                                                 │
└──────────┴──────────────────────────────────────────────────┘
```

- **Remove from `/experiments` index:** L1 category tabs, filter search, listbox container borders, `demo` / ↗ tags on nav items.
- **Keep:** Preview column and demo detail route `/experiments/[slug]` unchanged.
- **Main content:** Add horizontal offset (padding or grid) so preview does not sit under the fixed sidebar on large viewports.

---

## 2. Floating sidebar

### Position & shape

- **Desktop (≥ 45em):** `position: fixed`; anchor **left**; vertical inset below header (e.g. `top: 6–8rem`); `z-index` below mobile menu toggle but above page background.
- **Panel:** Same treatment as `.nav-primary`:
  - `font-condensed uppercase tracking-xl`
  - Background `hsl(var(--color-dark) / 0.95)`; with `@supports (backdrop-filter)` use `hsl(var(--color-white) / 0.05)` + `blur(1.5rem)`
  - **Rounded corners:** `border-radius: 0 1em 1em 0` (mirror of main nav’s `1em 0 0 1em` on the right)
  - Horizontal padding aligned with main nav clamp values where practical

### List content

- **Source:** `getCollection('experiments')` filtered to `featured: true`.
- **Sort:** Title A–Z (all items are featured; no extra featured ordering unless tie-breaker needed later).
- **Empty state:** If zero featured experiments, hide sidebar or show short message in main column; preview falls back to first experiment in collection for default `exp` only when no featured exist (edge case).

### Each link

- **Label:** Experiment `title` only.
- **Control:** `<button type="button">` for preview updates (not full navigation on select).
- **No** trailing icons, badges, or category labels.

### Active (selected) state

- `border-inline-start: 0.2rem solid hsl(var(--color-white))`
- Background `hsl(var(--color-white) / 0.06)`
- Adjust padding-inline-start so text aligns with inactive rows
- `aria-current="true"` on the active control

### Inactive / hover

- Transparent background; hover/focus-visible: `hsl(var(--color-white) / 0.04)`
- No underline tab pattern on sidebar items (left border denotes selection, not bottom border)

### Scroll

- If featured count grows, **scroll inside the panel**: `max-height: min(70vh, …)`; `overflow-y: auto` on the list wrapper.

### Footer link (placeholder)

- Text link at bottom of panel: **All experiments →**
- **Href:** `/experiments/all` — phase 1.5 may ship a minimal placeholder page (“Coming soon”) or link disabled until masonry spec exists.
- Styled as mono/condensed text link consistent with site (underline on hover), not `button-large`.

---

## 3. Preview column & URL

- **Remove** `?category=` handling from index script and docs.
- **Keep** `?exp=<slug>`:
  - Sidebar click → update preview + `history.replaceState`
  - `popstate` restores selection
  - Invalid `exp` → first featured slug, else first experiment in collection
- **Deep link:** `?exp=` for non-featured experiments still shows preview (item not highlighted in sidebar).

---

## 4. Mobile (&lt; 45em)

- Do not use a full-height fixed sidebar (conflicts with preview space).
- **Pattern:** Collapsible control (e.g. “Featured experiments”) opening a **slide-over or dropdown panel** reusing the same list markup and styles as desktop sidebar.
- Alternatively: horizontal scroll of experiment names — only if slide-over proves heavy; default spec is slide-over/panel for parity with mobile main nav.

---

## 5. Components & files (implementation hint)

| Unit | Responsibility |
|------|----------------|
| `ExperimentSidebar.astro` | Markup for panel + list + footer link; accepts featured entries + active slug |
| Shared tokens (optional) | Extract nav panel surface styles to a shared class or partial to avoid drift from `HeaderPrimary` |
| `experiments/index.astro` | Layout grid/offset; preview host; slim client script for `exp` only |
| `experiments/all/index.astro` | **Out of scope** until masonry spec |

Remove category constants and category-filter logic from index when implementing.

---

## 6. Accessibility

- Sidebar wrapper: `<nav aria-label="Featured experiments">`
- List: semantic `ul` / `li`
- Selected item: `aria-current="true"`
- Mobile panel: focus trap optional; at minimum `aria-expanded` on toggle
- Keyboard: arrow keys optional enhancement; minimum viable is tab order through buttons

---

## 7. Testing

- Featured sidebar lists only `featured: true` items.
- Selecting item updates preview and URL `?exp=`.
- Active styling: white left border, no right icons.
- No category tabs visible.
- Build passes; manual check desktop + mobile panel.
- `/experiments?exp=token-playground` loads correct preview.

---

## 8. Follow-up (separate spec)

- **All experiments masonry** at `/experiments/all`: grid layout, sort/filter, click → preview or demo (TBD).

## Decisions log

| Decision | Choice |
|----------|--------|
| Sidebar contents | Featured experiments only |
| Category UI | Removed from index |
| Selection affordance | White left border, no tags |
| Visual system | Match main nav panel |
| All experiments | Link reserved; masonry deferred |
| URL | `?exp=` only on index |
