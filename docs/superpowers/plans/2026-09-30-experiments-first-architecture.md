# Experiments-first architecture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the codebase with the experiments-first site model: `display: inline | full-page`, demo rename, index panel + detail page behavior, dead code removal, and masonry on `/experiments/all`.

**Architecture:** Content collection frontmatter drives routing; `demo-registry.ts` globs `src/experiments/demos/*.astro`; index derives preview behavior from `display`; full-page detail uses `Main` + shared demo component; masonry lists all `published` entries. Home, about, projects coming soon untouched.

**Tech Stack:** Astro 5, Content Collections (glob loader + Zod), scoped CSS in components, static GitHub Pages deploy.

## Global Constraints

- Public pages use **`Main.astro`** only (except **`DesignSystem.astro`**).
- Do not change **home** or **about** page structure/copy unless a task explicitly requires a import path fix.
- **`/projects`** stays coming soon.
- **`published: false`** entries excluded from index, masonry, and `[slug]` paths.
- Sidebar max **10** featured (`MAX_SIDEBAR_EXPERIMENTS = 10`).
- Show-all link when **`published count > 10`** → `/experiments/all`.
- Full-page index CTA: **`target="_blank"`** `rel="noopener noreferrer"` to `/experiments/<slug>`.
- Author-facing: remove **`kind`**, **`demoEmbedUrl`**, and **`preview`** (derive from **`display`**).
- Verification command: **`npm run build`** (no automated test suite in repo).

## File map (target)

| Path | Responsibility |
|------|----------------|
| `src/content/config.ts` | `display` enum; validation; drop old fields |
| `src/experiments/demo-registry.ts` | glob `/src/experiments/demos/*.astro` |
| `src/experiments/demos/*.astro` | Demo UI (renamed from `embed/`) |
| `src/pages/experiments/index.astro` | Lab; load demos; build guard for inline |
| `src/components/ExperimentPanel.astro` | Copy + preview; full-page CTA |
| `src/pages/experiments/[slug].astro` | Full-page detail only |
| `src/pages/experiments/all/index.astro` | Masonry grid |
| `src/content/experiments/TEMPLATE.md` | Author template |
| `src/content/experiments/animation1.md` | WIP sample — update fields |

**Delete:** `embed-registry.ts`, `embed/` folder, `ExperimentCard.astro`, `Card.astro`, `Cards.astro`, `Footer.astro` (if still unused).

---

### Task 1: Schema — `display` replaces `kind` / `preview` / `demoEmbedUrl`

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/content/experiments/animation1.md`
- Modify: `src/content/experiments/TEMPLATE.md`

**Interfaces:**
- Produces: `ExperimentEntry.data.display: 'inline' | 'full-page'`

- [ ] **Step 1:** In `config.ts`, add `experimentDisplay = z.enum(['inline', 'full-page'])`, field `display` default `'inline'`.

- [ ] **Step 2:** Remove `experimentKind`, `kind`, `demoEmbedUrl`, `experimentPreview`, `preview` from schema.

- [ ] **Step 3:** Update `superRefine`:
  - `display === 'full-page'` → require `thumbnail`
  - `featured === true` → warn/issue on missing `sidebarOrder` (keep existing behavior)

- [ ] **Step 4:** Update `animation1.md` and `TEMPLATE.md`:

```yaml
display: inline
published: false
featured: false
# remove: kind, preview
```

- [ ] **Step 5:** Run `npm run build` — fix any content validation errors.

- [ ] **Step 6:** Commit: `refactor(content): experiment display modes in schema`

---

### Task 2: Rename embed → demos + registry

**Files:**
- Create: `src/experiments/demo-registry.ts`
- Create: `src/experiments/demos/animation1.astro` (move from embed)
- Delete: `src/experiments/embed-registry.ts`, `src/experiments/embed/animation1.astro`
- Modify: `src/pages/experiments/index.astro` (imports)

**Interfaces:**
- Produces: `demoModules`, `demoPathForSlug(slug)`, `hasDemo(slug)` — same signatures as current embed-registry

- [ ] **Step 1:** Add `demo-registry.ts`:

```typescript
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export type DemoModule = { default: AstroComponentFactory };

export const demoModules = import.meta.glob<DemoModule>('/src/experiments/demos/*.astro');

export function demoPathForSlug(slug: string) {
  return `/src/experiments/demos/${slug}.astro`;
}

export function hasDemo(slug: string) {
  return demoPathForSlug(slug) in demoModules;
}
```

- [ ] **Step 2:** Move `embed/animation1.astro` → `demos/animation1.astro` (identical content).

- [ ] **Step 3:** In `index.astro`, replace `embed-registry` imports with `demo-registry`; rename `loadLiveDemo` / map keys as needed.

- [ ] **Step 4:** Delete old embed files.

- [ ] **Step 5:** Run `npm run build`.

- [ ] **Step 6:** Commit: `refactor: rename experiment embeds to demos`

---

### Task 3: Index build guard + derive preview from `display`

**Files:**
- Modify: `src/pages/experiments/index.astro`

**Interfaces:**
- Consumes: `entry.data.display`, `hasDemo(id)`
- Produces: props to `ExperimentPanel`: `display`, `LiveDemo?`, `thumbnail?`

- [ ] **Step 1:** When looping published entries, for `display === 'inline'`, if `!hasDemo(id)` throw:

```typescript
throw new Error(
  `[experiments] "${id}" is published with display: inline but src/experiments/demos/${id}.astro is missing.`,
);
```

- [ ] **Step 2:** Only preload demo modules for `display === 'inline'`.

- [ ] **Step 3:** Pass `display={entry.data.display}` to `ExperimentPanel` instead of `preview`.

- [ ] **Step 4:** Remove `detailHref` logic tied to `kind === 'demo'`.

- [ ] **Step 5:** Run `npm run build`.

- [ ] **Step 6:** Commit: `feat(experiments): index uses display mode and demo registry`

---

### Task 4: ExperimentPanel — inline vs full-page

**Files:**
- Modify: `src/components/ExperimentPanel.astro`

**Interfaces:**
- Consumes: `display: 'inline' | 'full-page'`, `slug` (add prop), `LiveDemo?`, `thumbnail?`
- Produces: preview region + actions

- [ ] **Step 1:** Replace `preview` prop with `display` and add required `slug: string`.

- [ ] **Step 2:** Preview region:
  - `inline` + `LiveDemo` → render `<LiveDemo />`
  - `inline` + !`LiveDemo` → error message (should not happen if build guard works)
  - `full-page` + `thumbnail` → poster figure (reuse existing poster styles)
  - `full-page` + !`thumbnail` → schema should prevent; optional fallback message

- [ ] **Step 3:** Actions block for `full-page`:

```astro
<a
  class='experiment-panel__link font-mono uppercase'
  href={`/experiments/${slug}`}
  target='_blank'
  rel='noopener noreferrer'
>
  Open exploration ↗
</a>
```

- [ ] **Step 4:** Keep `externalUrl` link unchanged when set.

- [ ] **Step 5:** Pass `slug` from `index.astro` (`experimentId(entry)`).

- [ ] **Step 6:** Run `npm run build`; manual check with one published inline test entry if available.

- [ ] **Step 7:** Commit: `feat(ExperimentPanel): inline and full-page preview modes`

---

### Task 5: Full-page detail page

**Files:**
- Modify: `src/pages/experiments/[slug].astro` (rewrite)
- Optional create: `src/components/ExperimentDetail.astro` (minimal shell)

**Interfaces:**
- Consumes: `demo-registry`, collection entry with `display === 'full-page'`

- [ ] **Step 1:** `getStaticPaths`:

```typescript
const entries = await getCollection('experiments', ({ data }) =>
  data.published === true && data.display === 'full-page',
);
```

- [ ] **Step 2:** Load `Demo` from `demoModules[demoPathForSlug(entry.id)]`; if missing, throw at build time for that slug.

- [ ] **Step 3:** Layout: `Main` with `bodyClass='experiments'`, minimal top link back to `/experiments`, full-bleed wrapper around `<Demo />`.

- [ ] **Step 4:** Remove iframe, `ExperimentCard`, `demoEmbedUrl`, `render(entry)` unless body markdown needed later.

- [ ] **Step 5:** Run `npm run build`.

- [ ] **Step 6:** Commit: `feat(experiments): full-page detail route`

---

### Task 6: Remove dead components

**Files:**
- Delete: `src/components/ExperimentCard.astro`, `src/components/Card.astro`, `src/components/Cards.astro`, `src/components/Footer.astro`
- Grep: ensure no remaining imports

- [ ] **Step 1:** `rg ExperimentCard Card\.astro Cards Footer` — fix any stragglers.

- [ ] **Step 2:** Delete files listed above.

- [ ] **Step 3:** Run `npm run build`.

- [ ] **Step 4:** Commit: `chore: remove unused experiment and card components`

---

### Task 7: Masonry — `/experiments/all`

**Files:**
- Modify: `src/pages/experiments/all/index.astro`
- Optional create: `src/components/ExperimentMasonryCard.astro`

**Interfaces:**
- Consumes: all `published` experiments sorted (title or `sidebarOrder`)

- [ ] **Step 1:** Load `(await getCollection('experiments', ({ data }) => data.published)).sort(...)`.

- [ ] **Step 2:** Page structure: `Main`, `h1` “All experiments”, link back to `/experiments`, masonry grid container.

- [ ] **Step 3:** Card per entry:
  - Title, description (truncated optional), category as muted label
  - `inline`: thumbnail if present else placeholder; no live embed in v1 (per spec)
  - `full-page`: thumbnail; link to `/experiments/[slug]` with `target="_blank"`

- [ ] **Step 4:** CSS: CSS columns or grid masonry using existing design tokens (`global.css` / scoped). Mobile single column; wider multi-column.

- [ ] **Step 5:** Run `npm run build`.

- [ ] **Step 6:** Manual test: temporarily mark 11+ published fixtures OR trust layout with 1 entry; verify show-all link on index when count > 10.

- [ ] **Step 7:** Commit: `feat(experiments): masonry all experiments page`

---

### Task 8: Documentation + spec hygiene

**Files:**
- Modify: `docs/superpowers/specs/2026-09-30-site-architecture-experiments-first-design.md` → **Status: Implemented**
- Modify: `docs/superpowers/specs/2026-09-29-content-structure-design.md` → note superseded
- Modify: `README.md` (if exists) or add short pointer in spec only

- [ ] **Step 1:** Add “Adding an experiment” bullet list to architecture spec or README (link to TEMPLATE.md).

- [ ] **Step 2:** Mark outdated experiment specs with one-line superseded banner pointing to 2026-09-30 architecture spec.

- [ ] **Step 3:** Commit: `docs: experiments-first architecture implemented`

---

## Plan self-review (coverage)

| Spec section | Task |
|--------------|------|
| IA / home-about unchanged | Global constraints; no tasks touch those pages |
| `display` modes | Tasks 1, 3, 4, 5 |
| Index lab + published gate | Tasks 3, 4 |
| Show all > 10 | Task 7 + existing sidebar |
| Masonry `/all` | Task 7 |
| Full-page detail | Task 5 |
| Rename demos | Task 2 |
| Remove CodePen / dead UI | Tasks 5, 6 |
| Authoring template | Tasks 1, 8 |

No TBD placeholders in steps. Build used in place of unit tests.
