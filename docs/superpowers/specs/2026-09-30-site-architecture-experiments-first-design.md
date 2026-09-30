# Site architecture — experiments-first iteration — design spec

**Status:** Implemented  
**Date:** 2026-09-30  
**Supersedes (partially):** `2026-09-29-content-structure-design.md` (projects carousel, tabbed index, CodePen demos), experiment specs referencing iframe embed routes and `kind: demo`.

## Summary

Portfolio iteration **B — experiments-first**: **home** and **about** stay as-is; **projects** remains **coming soon**; engineering focus is **experiments** for the next few weeks. The index is a **viewport lab** for up to **10 featured** items in the sidebar, with **show all → masonry** when more than **10 published** experiments exist. Two **display modes** share the same metadata: **inline** (live animation in the stage) and **full-page** (poster on index, detail on `/experiments/[slug]` opened in a **new tab**).

## Goals

- One clear author and runtime model for experiments.
- Single document shell for the public site: **`Main.astro`** (except **`DesignSystem.astro`**).
- Remove dormant paths (CodePen detail, unused components) during implementation.
- **`/experiments/all`** becomes the next major UX deliverable (masonry).

## Non-goals (this iteration)

- Project case studies (`/projects/[slug]`, projects collection UI).
- Category tabs on the index (optional later on masonry).
- Separate embed URL or second HTML layout for demos.
- Changing home/about copy or layout structurally.

---

## 1. Site information architecture

| Route | Layout | Purpose |
|--------|--------|---------|
| `/` | `Main` | Home — unchanged |
| `/about` | `Main` | About — unchanged |
| `/resume` | `Main` | Resume markdown — unchanged |
| `/projects` | `Main` | **Coming soon** only |
| `/experiments` | `Main` | Lab **or** coming soon (no published entries) |
| `/experiments/all` | `Main` | **Masonry** — all published experiments (implement next) |
| `/experiments/[slug]` | `Main` | **Full-page explorations only** (`display: full-page`) |
| `/design-system` | `DesignSystem` | Internal — independent document |
| Redirects | `astro.config.mjs` | Legacy case-study / project slugs → `/projects` |

**Navigation:** Existing primary nav (Home, Experiments, Projects, About). Active state via `bodyClass` tokens on `Main`.

---

## 2. Experiment display modes

Replace **`kind: card | demo`** and **`demoEmbedUrl`** with **`display`**:

| `display` | Index stage | Detail page |
|-----------|-------------|-------------|
| **`inline`** | Live **`demos/<slug>.astro`** in `ExperimentPanel` preview | None required |
| **`full-page`** | **Poster/card** (`thumbnail` required) + same copy/meta | **`/experiments/<slug>`** — full exploration; CTA from index uses **`target="_blank"`** `rel="noopener noreferrer"` |

**Shared frontmatter (both modes):** `title`, `description`, `category`, `meta`, `externalUrl` (optional), `published`, `featured`, `sidebarOrder`.

### Preview field (index panel)

| `display` | Index preview behavior |
|-----------|-------------------------|
| `inline` | Treat as **`live`**: load demo component |
| `full-page` | Treat as **`poster`**: `thumbnail` image in stage; primary action opens detail URL in new tab |

Implementation may map `display` → internal preview mode in code and **deprecate author-facing `preview`** enum, or keep `preview` in sync via schema refine — **prefer deriving from `display`** to avoid contradictory author input.

### Validation rules

| Rule | When |
|------|------|
| `thumbnail` required | `display: full-page` |
| Demo file required | `published: true` and `display: inline` → `src/experiments/demos/<slug>.astro` must exist (build error) |
| `sidebarOrder` recommended | `featured: true` |
| Detail route generated | `published: true` and `display: full-page` only |

---

## 3. Index lab (`/experiments`)

### Published gate

- **`published: false`** — hidden from index, sidebar, masonry, and `[slug]` paths; WIP authoring allowed (demo file optional until publish).
- **`published: true`** — included in counts, panels, masonry, and static paths per rules above.

### Sidebar — “10 selected”

- **`featured: true`** + **`sidebarOrder`** — curated list, **max 10** (existing `MAX_SIDEBAR_EXPERIMENTS`).
- Sort by `sidebarOrder`, then title.

### Main column

- Section label + dynamic **`h2`** experiment title (existing).
- **`ExperimentPanel`** per **published** experiment (toggle via `?exp=` + sidebar).
- **Sidebar highlight** only for featured slugs; switching among **all published** via URL/`?exp=` remains allowed (document in author guide).

### Show all link

- Visible when **`published count > 10`** (existing `showAllLink` on sidebar).
- Target: **`/experiments/all`**.

### Coming soon

- When **zero** published experiments — same pattern as projects (no viewport shell).

---

## 4. All experiments (`/experiments/all`)

**Status:** Design approved; **implementation is next focus** after schema/route cleanup.

- **Masonry** layout of **all published** experiments.
- Card shows shared metadata; visual by `display`:
  - **inline** — poster/thumbnail or small static preview (live optional later for perf).
  - **full-page** — thumbnail + link to detail (new tab).
- Link back to **`/experiments`** (featured lab).
- Category filters — **deferred**; grid should not block adding filters later.

---

## 5. Full-page detail (`/experiments/[slug]`)

- **`getStaticPaths`:** `published && display === 'full-page'`.
- **`Main`** layout; **full-bleed** exploration (minimal back link acceptable).
- Content source: **per-slug Astro demo** under `src/experiments/demos/<slug>.astro` reused on detail page, **or** dedicated `src/experiments/full/<slug>.astro` if inline and full-page demos diverge — **default: same `demos/` file** rendered full viewport on detail only when `display: full-page`; if inline-only demos must stay small, split folders in a follow-up.
- **Remove** CodePen iframe layout and **`ExperimentCard`** demo layout.

---

## 6. Authoring workflow

1. Copy **`src/content/experiments/TEMPLATE.md`** → `<slug>.md`.
2. Add demo **`src/experiments/demos/<slug>.astro`** (same slug) when `display: inline`, or when full-page detail uses Astro demo.
3. Develop with **`published: false`** until ready.
4. Publish: **`published: true`**; set **`featured`** / **`sidebarOrder`** for sidebar if among top 10.
5. **`npm run build`** validates published inline + demo file presence.

### Example — inline animation

```yaml
title: 'Orb drift'
description: '…'
category: exper
display: inline
published: true
featured: true
sidebarOrder: 2
```

### Example — full-page exploration

```yaml
title: 'Layout study'
description: '…'
category: design
display: full-page
thumbnail: /images/experiments/layout-study.png
published: true
featured: true
sidebarOrder: 5
```

Index CTA: **Open exploration ↗** → `/experiments/layout-study` (`target="_blank"`).

---

## 7. Codebase structure (target)

```text
src/content/experiments/*.md          # metadata (collection)
src/experiments/demos/*.astro         # runnable UI (rename from embed/)
src/experiments/demo-registry.ts      # import.meta.glob (rename from embed-registry)
src/pages/experiments/index.astro     # lab
src/pages/experiments/all/index.astro # masonry
src/pages/experiments/[slug].astro      # full-page only
src/components/ExperimentPanel.astro
src/components/ExperimentSidebar.astro
src/scripts/experiment-sidebar-drawer.ts
src/layouts/Main.astro                # sole public HTML shell
```

### Remove or replace (implementation phase)

| Item | Action |
|------|--------|
| `kind`, `demoEmbedUrl` | Remove from schema |
| CodePen `[slug]` layout | Replace with full-page detail |
| `ExperimentCard.astro` | Remove or replace with detail shell |
| `Card.astro`, `Cards.astro`, `Footer.astro` | Remove if still unused |
| `src/experiments/embed/` | Rename to `demos/` |
| Outdated experiment specs | Mark superseded; link here |

### Keep unchanged

- Home, about, projects coming soon, design system layout.
- **`projects`** collection stub (empty OK until projects phase).
- Umami, deploy workflow, redirects.

---

## 8. Testing / verification

- `npm run build` passes.
- Unpublished WIP does not appear on index or masonry.
- Published inline without demo file → build fails with explicit slug message.
- Published full-page without thumbnail → schema/build error.
- Index: ≤10 featured in sidebar; show-all when >10 published.
- Full-page index link opens detail in new tab.
- Home/about/projects unchanged smoke check.

---

## 9. Decision log

| Decision | Rationale |
|----------|-----------|
| Experiments-first (B) | User priority next few weeks |
| `display: inline \| full-page` | Matches animation-in-place vs exploration-in-new-tab |
| On-site detail, not CodePen | User intent; single domain shell |
| Masonry on `/all` | Explicit next focus after cleanup |
| Rename embed → demos | Clarity after embed route removal |
| All published in `?exp=` | Reachable before masonry; sidebar stays curated |

---

## 10. Implementation order (suggested)

1. Schema migration (`display`, drop `kind` / `demoEmbedUrl`); rename embed → demos + registry.
2. `ExperimentPanel` branching + full-page new-tab CTA; detail page rewrite.
3. Remove dead components and CodePen paths.
4. **`/experiments/all` masonry**.
5. Architecture note in README or `docs/` pointing to this spec.
