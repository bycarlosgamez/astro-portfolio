# Experiments index — viewport stage & authoring — design spec

**Status:** Implemented  
**Date:** 2026-09-29  

## Summary

Turn `/experiments` into a **fixed-height lab shell** (no document scroll): sidebar navigation, main column keeps **section title + experiment title + description + meta + actions**, and a **flexible stage** below for **live demos** (CSS/GSAP) or **posters** (whole-page / link-out work). Authoring uses **content collection frontmatter**, a **copy template**, **curated sidebar order**, and **same-origin embed routes** for live previews.

## Goals

- Use viewport real estate for small interactive experiments without growing the page.
- Keep existing information hierarchy in the main column (no move to overlay-only metadata).
- Clear, repeatable workflow when adding experiments.
- Curated “main 10” sidebar items, not alphabetical accident.

## Non-goals

- Rebuilding `/experiments/all` masonry (still deferred).
- Changing site-wide `body` grid; viewport lock applies to **experiments index only**.
- Hosting arbitrary third-party scripts without sandboxed iframe/embed boundaries.

---

## Layout (experiments index)

### Viewport shell

- On `/experiments` only: root layout height = **viewport minus site header**; **`overflow: hidden`** on the scroll container (not necessarily `html` globally—scoped wrapper is fine).
- Structure: **header (existing)** → **`.experiment-layout`** fills remaining height (`min-height: 0`).

### Columns (≥ 45em)

- **Grid unchanged in spirit:** sidebar width vars + main column.
- **Both columns:** `height: 100%`, `min-height: 0`, `overflow: hidden`.
- **Sidebar:** list may **`overflow-y: auto`** if more than ~10 items or short viewports (nav scroll is industry-standard for fixed shells; page does not scroll).

### Main column (flex column)

1. **Chrome block** (shrink-wrap):  
   - `h1` `01 Selected experiments` (compact eyebrow)  
   - `h2` active experiment title (dynamic)  
   - Description, meta `<dl>`, action links (Open demo / external)  
   - No intentional truncation on index unless content exceeds a defined max (see overflow).

2. **Stage block** (`flex: 1; min-height: 0; overflow: hidden`):  
   - Renders by `preview` mode (below).  
   - Live demos scale within stage; posters **letterbox/contain**; no oversized images expanding the document.

### Mobile (&lt; 45em)

- Bottom bar + slide-over sidebar (existing pattern).
- Same chrome + stage stack inside main; stage gets remaining height above bottom bar (`padding-bottom` for bar already exists).

### Overflow policy

| Region | Scroll |
|--------|--------|
| Document / page | **No** |
| Sidebar list | **Auto** if needed |
| Stage | **No** (demo must fit or scale); iframe internal scroll acceptable |
| Chrome block | **Avoid**; if copy is long, prefer shorter index description + detail page |

---

## Content model

### Existing fields (keep)

- `title`, `description`, `category`, `kind` (`card` | `demo`)
- `thumbnail`, `externalUrl`, `demoEmbedUrl`, `featured`, `meta`

### New fields

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `preview` | `'live' \| 'poster' \| 'none'` | Yes (default `'none'`) | What the stage shows on index |
| `sidebarOrder` | `number` (int) | When `featured: true` | Curated sidebar order (1 = top) |

### Validation rules

- `preview: 'poster'` → require `thumbnail`.
- `preview: 'live'` → require resolvable embed (see embed convention); no external `demoEmbedUrl` required on index.
- `kind: 'demo'` → still require `demoEmbedUrl` for **`/experiments/[slug]`** full demo page (unchanged).
- `featured: true` → **should** set `sidebarOrder`; build warns if missing (optional zod refine).

### Sidebar selection (main 10)

```text
featured === true
  → sort by sidebarOrder ascending
  → tie-break: title localeCompare
  → slice(0, 10)
```

- Default active experiment / SSR default slug: **first item after that sort** (not alphabetical among all featured).
- Experiments with `featured: false` or `sidebarOrder` outside top 10: reachable via **`?exp=`** and **`/experiments/all`**, not listed in sidebar.
- `?exp=` for non-sidebar slug: main column shows content; sidebar has no `aria-current` match (existing behavior, documented).

### Preview modes (stage)

| `preview` | Stage UI | Typical use |
|-----------|----------|-------------|
| `live` | iframe → `/experiments/embed/{slug}` (sandboxed) | CSS, GSAP, small UI motion |
| `poster` | `<img>` or figure, `object-fit: contain`, max 100% stage | Full-page app, CodePen-as-link, WIP |
| `none` | Empty / subtle placeholder | Checklists, text-only notes |

Chrome (description, meta, links) **always** from markdown regardless of `preview`.

---

## Live embed convention (best practice)

- Route: **`/experiments/embed/[slug]`** — minimal layout (no `HeaderPrimary`, dark bg, full width/height of iframe).
- **Static paths:** one path per experiment that has `preview: 'live'` (from content collection at build time).
- Source file per demo: **`src/experiments/embed/{slug}.astro`** (or `{slug}/index.astro`) — colocated with slug, not in markdown body.
- iframe on index: `sandbox="allow-scripts allow-same-origin"`, `title="{experiment title} preview"`, `flex: 1` height chain from stage.
- **Why iframe + same-origin:** isolates demo CSS/JS from portfolio shell; standard pattern (CodeSandbox, StackBlitz, design systems docs).

Optional later: shared `EmbedLayout.astro` for embed pages only.

---

## Author workflow

### 1. Copy template

Add **`src/content/experiments/TEMPLATE.md`** for authors only. Exclude from the collection in `src/content/config.ts` (e.g. ignore `TEMPLATE.md` / `*.template.md`) so it never builds as a route.

Template sections: checklist + frontmatter examples for `live`, `poster`, `none`.

### 2. Add content entry

`src/content/experiments/my-slug.md` with frontmatter.

### 3. Sidebar

- `featured: true`, `sidebarOrder: N` (1–10 for visible set).

### 4. Stage

- `preview: live` → create `src/experiments/embed/my-slug.astro` + register via `[slug]` static paths filtered by `preview === 'live'`.
- `preview: poster` → set `thumbnail`.
- `preview: none` → no embed file.

### 5. Full demo page (optional)

- `kind: demo` + `demoEmbedUrl` → existing `/experiments/[slug]` page; link from chrome “Open demo →”.

### 6. Verify

- `/experiments?exp=my-slug`, sidebar order, no page scrollbar, stage fills remaining height.

---

## Components & files (implementation map)

| Area | Files |
|------|--------|
| Schema | `src/content/config.ts` — `preview`, `sidebarOrder`, refines |
| Template | `src/content/experiments/TEMPLATE.md` |
| Index layout | `src/pages/experiments/index.astro` — viewport shell, stage switch |
| Stage UI | `src/components/ExperimentStage.astro` (new) — live iframe / poster / none |
| Chrome | Refactor from `ExperimentPreview.astro` — chrome without duplicating title in stage |
| Embed layout | `src/layouts/ExperimentEmbed.astro` (new, minimal) |
| Embed pages | `src/pages/experiments/embed/[slug].astro` + `src/experiments/embed/*.astro` demos |
| Sidebar sort | `index.astro` query — `sidebarOrder` not title-only |
| CSS | `index.astro` + possibly `body.experiments` vars for `--experiment-chrome-*` / stage height |

---

## Migration (current 10 markdown files)

- Set explicit `preview`: poster where `thumbnail` exists; else `none`; demos may stay poster on index until embeds exist.
- Assign `sidebarOrder: 1..10` to current featured set (curate order intentionally).
- Add `preview` default `'none'` in schema for backwards compatibility.
- Migrate `nav-underline-demo` etc.: index stage poster; full demo remains `[slug]` iframe.

---

## Accessibility

- iframe `title` from experiment title.
- Stage region: `role="region"` + `aria-label="Experiment preview"` (or labelled by `h2`).
- `h2` `aria-live="polite"` on title change (keep).
- Keyboard: sidebar buttons unchanged.

---

## Testing

- Viewport: desktop, tablet, mobile; no document `scrollHeight > clientHeight` on index.
- Switch all sidebar items; stage and chrome update; `?exp=` deep link.
- Live embed: script runs in sandbox; no layout escape.
- Poster: no image-driven page scroll.
- 11th featured item excluded from sidebar but reachable via URL/all page.

---

## Open decisions (defaults chosen)

- **Sidebar scroll:** allowed (recommended).  
- **Chrome long copy:** author short descriptions on index; no chrome scroll in v1.  
- **TEMPLATE filename:** `TEMPLATE.md` with collection exclude if needed.
