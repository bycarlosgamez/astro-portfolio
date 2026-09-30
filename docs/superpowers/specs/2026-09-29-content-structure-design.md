# Content structure design — hybrid projects + experiments index

**Branch:** `feat/content-structure-hybrid`  
**Status:** Superseded — see `2026-09-30-site-architecture-experiments-first-design.md`  
**Date:** 2026-09-29

## Summary

Case studies are **projects** (long-form, ≤5 flagship items). **Experiments** are numerous side explorations (25+) listed on a single index with category tabs; only items marked as demos get optional CodePen-style detail pages. Content lives in **Astro Content Collections** for typed frontmatter and low-friction Git-based authoring.

## 1. Information architecture

| Route | Role |
|--------|------|
| `/` | Intro; CTA to experiments or featured project |
| `/projects` | Carousel/list of flagship projects (order from content) |
| `/projects/[slug]` | Long-form case study |
| `/experiments` | Filterable index (tabs = categories) |
| `/experiments/[slug]` | Optional demo layout (preview + copy + links) |
| `/about`, `/resume` | Unchanged |

**Navigation:** Keep Experiments (01) and Projects (02). No separate “case studies” nav item.

**Redirects:** After migration, `/case-studies/:slug` → `/projects/:slug` (Astro redirects or hosting rules).

## 2. Data model

### Collection: `projects`

| Field | Required | Notes |
|--------|----------|--------|
| `title` | yes | Display title |
| `subtitle` | yes | One-line summary |
| `poster` | yes | Path under `public/` |
| `order` | yes | Integer for `/projects` carousel (lower = first) |
| Body | yes | Markdown narrative (existing case study structure) |

Slug from filename: `src/content/projects/design-system.md` → `/projects/design-system`.

Layout: reuse `Portfolio.astro` (or equivalent wired to collection entry).

### Collection: `experiments`

| Field | Required | Notes |
|--------|----------|--------|
| `title` | yes | |
| `description` | yes | Short blurb for index/detail |
| `category` | yes | `exper` \| `design` \| `develop` \| `other` — maps to tab filters |
| `kind` | yes | `card` (default) \| `demo` |
| `thumbnail` | no | Index hero/preview image |
| `externalUrl` | no | CodePen, repo, Figma, etc. |
| `featured` | no | Surface at top of index |
| `meta` | no | Optional array of `{ label, value }` for sidebar stats (replaces hard-coded ExperimentCard props) |

**`kind: card`:** Renders only on `/experiments` (card + external link if set). No `[slug]` page generated (filter in `getStaticPaths` or use `draft`/flag).

**`kind: demo`:** Generates `/experiments/[slug]` with demo layout.

**Demo embedding (implementation choice — pick one):**

- **Preferred for friction:** `demoEmbedUrl` (CodePen/Sandbox embed URL) in frontmatter.
- **Fallback:** static asset or small island under `public/experiments/[slug]/` if self-hosted.

Schema lives in `src/content/config.ts` with Zod validation.

## 3. Authoring workflow

1. **Add a project:** Create `src/content/projects/my-project.md` with frontmatter + body. Set `order`. Add poster to `public/images/`.
2. **Add a card-only experiment:** Create `src/content/experiments/my-sketch.md` with `kind: card`, category, description, optional `thumbnail` and `externalUrl`.
3. **Add a demo experiment:** Same folder with `kind: demo` and `demoEmbedUrl` (or chosen embed strategy).
4. **Local check:** `npm run dev` — index and detail routes update automatically.
5. **Deploy:** Existing GitHub deploy workflow; no CMS.

**Migration (one-time):**

- Move `src/pages/case-studies/*.md` → `src/content/projects/*.md`.
- Adjust frontmatter to match collection schema (fields already align: `title`, `subtitle`, `poster`).
- Remove old `pages/case-studies` routes after redirects exist.
- Replace placeholder copy on `/projects` and `/experiments` with collection-driven UI.

**Not in scope for v1:** MDX components in body, CMS, search, RSS.

## 4. UI mapping (current codebase)

| Current | Target |
|---------|--------|
| `src/pages/case-studies/*.md` + `Portfolio.astro` | `content/projects` + dynamic `src/pages/projects/[slug].astro` |
| `src/pages/projects/index.astro` (placeholder carousel) | Load `getCollection('projects')` sorted by `order`; dot indicators = project count; swap article/image per selection (progressive enhancement or minimal JS) |
| `src/pages/experiments/index.astro` (hardcoded tabs + Moon card) | `getCollection('experiments')`; tabs filter by `category`; list/grid of cards; optional hero `thumbnail` for selected/featured item |
| `ExperimentCard.astro` | Props driven from entry: `title`, `description`, optional `meta[]` instead of fixed `infoTitle`/`p2` pairs |
| `HeaderPrimary.astro` | No change (URLs stay `/experiments`, `/projects`) |
| `Main.astro` / `global.css` | Keep grid areas (`grid-container--projects`, `--experiments`); wire real data |

### `/projects` index behavior

- Server-render all project summaries for SEO and no-JS fallback (show first project or full list).
- Dot controls switch visible project (match existing `.dot-indicators` pattern).

### `/experiments/[slug]` (demo only)

- New layout: split view — embed region + `ExperimentCard`-style metadata column.
- Link back to `/experiments` with category query or hash preserved if feasible.

## 5. Error handling & edge cases

- Build fails on invalid frontmatter (Zod) — intentional.
- Missing poster/thumbnail: omit image or use neutral placeholder; do not fail build.
- `kind: demo` without embed URL: fail build with clear schema error.
- Empty category tab: show empty state message on index.

## 6. Testing & verification

- `npm run build` succeeds with at least 2 projects and 3 experiments (mix of `card` and `demo`).
- Manual: nav links, one project detail, experiment tabs, one demo page, redirect from old case study URL.
- Lighthouse spot-check on index pages (no regression from embed iframes — lazy load demos).

## 7. Success criteria

- All real case study content reachable as `/projects/[slug]`.
- `/experiments` scales to 25+ items without 25 required detail pages.
- Adding a new experiment is a single markdown file + optional image.
- `v1` branch remains available for alternate content models on other branches.

## Decisions log

| Decision | Choice |
|----------|--------|
| Projects vs case studies | Projects are case studies |
| Experiment volume | Many (25+); index-first |
| Detail pages | Projects always; experiments optional (`kind: demo`) |
| Authoring | Content Collections + Markdown; minimal friction |
| Branch | `feat/content-structure-hybrid` |
