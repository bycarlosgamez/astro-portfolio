# Experiments index — single panel component — design spec

**Status:** Implemented  
**Date:** 2026-09-29  
**Supersedes (partially):** Viewport stage spec’s split between “chrome” and “stage” components; behavior unchanged, structure simplified.

## Summary

Replace **`ExperimentChrome` + `ExperimentStage` + `ExperimentEmbedShell`** with one **`ExperimentPanel.astro`** per selected experiment on `/experiments`. Each panel is a single block: description, meta, action links, and one preview region—without nested platform “stage” wrappers around live embeds.

The page header (`h1` section label + dynamic `h2` title) stays as today. Preview modes (`live` | `poster` | `none`) and sidebar/`?exp=` behavior stay as today.

## Goals

- One mental model: **one component = one experiment’s index content** (copy + preview).
- Remove redundant DOM layers (no embed shell inside stage inside demo root).
- Keep viewport shell, sidebar, and embed preload/registry unchanged.

## Non-goals

- Changing content schema or `/experiments/embed/[slug]` standalone route.
- Rebuilding `/experiments/all` or unused legacy components in this pass (optional delete noted below).
- Renaming demo-internal roots (e.g. `.stage` in `animation1.astro`)—document only.

---

## DOM structure

Each experiment remains a toggled panel for client-side `?exp=` switching:

```text
.experiment-preview-panel     (data-slug, hidden) — keep for JS
  .experiment-panel           (new unified root)
    description, meta dl, action links
    .experiment-panel__preview (role="region", aria-label="Experiment preview")
      live  → <LiveDemo /> directly (no intermediate shell)
      poster → figure/img (contain)
      none  → short empty message
```

**Delete:**

- `src/components/ExperimentChrome.astro`
- `src/components/ExperimentStage.astro`
- `src/components/ExperimentEmbedShell.astro`

**Add:**

- `src/components/ExperimentPanel.astro`

**Modify:**

- `src/pages/experiments/index.astro` — import `ExperimentPanel`; one component per entry; same props wiring as today (`liveDemoBySlug`, `detailHref` rules).

---

## Component contract — `ExperimentPanel`

| Prop | Type | Notes |
|------|------|--------|
| `description` | `string` | Plain paragraph |
| `meta` | `{ label, value }[]` | Optional; renders `<dl>` when non-empty |
| `externalUrl` | `string?` | External link with ↗ |
| `detailHref` | `string?` | “Open demo →” when `kind === 'demo'` |
| `preview` | `'live' \| 'poster' \| 'none'` | From content |
| `title` | `string` | For error/empty copy only (not visible heading) |
| `thumbnail` | `string?` | Poster mode |
| `LiveDemo` | `AstroComponentFactory?` | When `preview === 'live'` |

### Preview rules

| Mode | Render |
|------|--------|
| `live` + `LiveDemo` | Render component inside `__preview` |
| `live` + missing demo | Mono uppercase message: missing embed for title |
| `poster` + `thumbnail` | Contained image in figure |
| `none` | Message: no live preview on index |

No duplicate experiment title inside the panel.

---

## Styling

- Copy block: reuse chrome patterns (`flow flow-small`, existing link/meta styles)—migrate scoped CSS from `ExperimentChrome` into `ExperimentPanel`.
- Preview box: migrate from `ExperimentStage` (flex `1`, `min-height: 0`, border, background, centering for poster/empty). **Single** centering/padding on `__preview`; do not add a second wrapper for live mode.
- Parent layout: `.experiment-preview-panel` must remain a flex column child so the preview area still grows inside the viewport shell (same as current stage flex behavior).

---

## Unchanged systems

- `liveDemoBySlug` preload via `embed-registry.ts` on index build.
- `/experiments/embed/[slug].astro` minimal full document for direct/embed URL.
- `ExperimentSidebar`, viewport CSS on `body.experiments-index`, client script for `exp` param.
- Content collection fields and validation.

---

## Optional cleanup (same change or follow-up)

- **`ExperimentPreview.astro`:** Not imported anywhere in `src/`; safe to delete if no planned reuse, or leave with a comment in this spec only.
- **Viewport stage design doc:** Update status note that chrome/stage split is replaced by `ExperimentPanel` (doc hygiene, not blocking).

---

## Verification

- `npm run build` succeeds.
- `/experiments` with default and `?exp=` switches: copy + preview update; live demo renders once inside preview box (inspect DOM: no `experiment-embed-shell`, no nested `experiment-stage` + shell).
- Poster/none experiments (when present) show correct states.
- Mobile sidebar toggle still works (unchanged files, smoke check).

---

## Decision log

| Choice | Rationale |
|--------|-----------|
| Option A — single block | User-approved; simplest author/reader model |
| Keep `.experiment-preview-panel` wrapper | Preserves existing `?exp=` panel toggling without script changes |
| No `ExperimentEmbedShell` | Redundant with preview box after inline embed migration |
