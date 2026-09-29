# Main navigation active state — design spec

**Status:** Implemented  
**Date:** 2026-09-29  

## Problem

`HeaderPrimary.astro` hardcodes `class="active"` on Home. On `/experiments`, `/projects`, `/about`, and nested routes, Home still appears selected. On mobile (drawer, `max-width: 35rem`), CSS removes the underline on `.active`, so the current section has no visible selected state in the menu.

## Goals

1. Highlight the correct primary nav item for the current page (including nested routes under Experiments and Projects).
2. Keep **desktop** selection styling: existing `.underline-indicators` bottom border on the active `<li>`.
3. Give **mobile drawer** a clear current-item treatment without redesigning the horizontal nav pattern site-wide.

## Non-goals

- Changing nav URLs or labels.
- Matching experiments sidebar left-border styling on desktop.
- Auto-highlighting routes not in the nav (e.g. `/resume`) unless explicitly mapped later.
- Client-side pathname detection.

## Approach

Pass an explicit **`currentSection`** from `Main.astro` into `HeaderPrimary`, derived from the existing **`bodyClass`** prop via a small map. Refactor nav links into a data array and render with conditional `active` + `aria-current="page"`.

### Section map (`bodyClass` → nav id)

| `bodyClass`   | `currentSection` |
|---------------|------------------|
| `home`        | `home`           |
| `experiments` | `experiments`    |
| `projects`    | `projects`       |
| `about`       | `about`          |
| `case-study`  | `projects`       |
| (anything else) | omit / no active item |

Type for nav ids: `'home' | 'experiments' | 'projects' | 'about'`.

If `bodyClass` is unmapped, `HeaderPrimary` receives no active section (all items inactive).

### Nav items (single source)

| `id`          | `href`         | Index label |
|---------------|----------------|-------------|
| `home`        | `/`            | 00          |
| `experiments` | `/experiments` | 01          |
| `projects`    | `/projects`    | 02          |
| `about`       | `/about`       | 03          |

## Components

### `Main.astro`

- After reading `bodyClass`, compute `currentSection` using the map above (undefined when unmapped).
- Pass `currentSection={currentSection}` to `<HeaderPrimary />`.

### `HeaderPrimary.astro`

- Props: optional `currentSection?: 'home' | 'experiments' | 'projects' | 'about'`.
- Loop nav items; for each item:
  - `<li class:list={{ active: item.id === currentSection }}>`
  - `<a ... aria-current={item.id === currentSection ? 'page' : undefined}>`
- Remove hardcoded `active` on Home.

**Accessibility:** `aria-current="page"` on the active anchor only (not `aria-current="false"` on others).

## Styling

### Desktop (unchanged)

Global `.underline-indicators` continues to style direct children (`<li>`): active item gets full white text and solid bottom border. No new desktop rules required.

### Mobile drawer (`max-width: 35rem`)

**Remove** the rule that zeroes the border on active items:

```css
&.underline-indicators > .active {
  border: 0;
}
```

**Add** drawer-specific selection (scoped under the same media query):

- Inactive links: `color: hsl(var(--color-white) / 0.4)` on `li:not(.active) > a` (aligns with experiments sidebar inactive tone).
- Active item:
  - Full white text (already from `.underline-indicators > .active` where applicable).
  - **Left border** on the active `<li>`: `border-left: 0.2rem solid hsl(var(--color-white))`, with modest padding-inline-start so text does not jump against the panel edge.
  - **Bottom border off** for active in drawer only (`border-bottom-color: transparent`) so vertical list does not show a confusing underline; left accent is the mobile selected cue.

Hover/focus on inactive items: raise opacity or border similarly to sidebar (optional light hover on inactive only).

## Data flow

```text
Page / layout → Main(bodyClass) → map → currentSection → HeaderPrimary → li.active + a[aria-current=page]
```

No JavaScript changes required for active state (mobile toggle script unchanged).

## Verification

Manual checks after implementation:

| URL | Active nav |
|-----|------------|
| `/` | Home |
| `/experiments` | Experiments |
| `/experiments/all` | Experiments |
| `/experiments/[slug]` | Experiments |
| `/projects` | Projects |
| `/projects/[slug]` | Projects |
| `/about` | About |

Mobile (`≤35rem`): open drawer on each URL above; current item shows left accent + full white; others muted.

Desktop: current item shows underline; others default.

## Files touched

| File | Change |
|------|--------|
| `src/layouts/Main.astro` | Map `bodyClass` → `currentSection`; pass prop |
| `src/components/HeaderPrimary.astro` | Prop, nav data loop, mobile CSS |

## Risks

- **Drift:** New pages must set correct `bodyClass` on `Main`. Document the map in this spec; no second prop on every page unless a page needs nav highlight without body styling (not required now).
- **`resume.md`:** Uses `Main` without `bodyClass` today; out of scope—no nav highlight until frontmatter is fixed separately.
