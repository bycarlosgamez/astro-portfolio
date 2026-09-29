# Main navigation active state — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Highlight the correct primary nav item per route and show a clear selected state in the mobile drawer.

**Architecture:** `Main.astro` maps existing `bodyClass` to `currentSection` and passes it to `HeaderPrimary`, which renders nav from a data array with `li.active` and `aria-current="page"`. Mobile drawer CSS replaces the “hide active underline” rule with muted inactive links and a left border on the active item.

**Tech Stack:** Astro, scoped CSS in `HeaderPrimary.astro`, global `.underline-indicators` in `global.css`.

## Global Constraints

- Nav ids: `home` | `experiments` | `projects` | `about`.
- Map `case-study` → `projects`; unmapped `bodyClass` → no active item.
- Desktop: no change to global underline behavior.
- No client-side pathname logic.

---

### Task 1: Wire `currentSection` through `Main.astro`

**Files:**
- Modify: `src/layouts/Main.astro`

**Interfaces:**
- Produces: `<HeaderPrimary currentSection={...} />` where prop is optional union type.

- [ ] **Step 1:** Add map from `bodyClass` to section id; pass to `HeaderPrimary`.

### Task 2: Dynamic nav + mobile styles in `HeaderPrimary.astro`

**Files:**
- Modify: `src/components/HeaderPrimary.astro`

- [ ] **Step 1:** Add `navItems` array and `currentSection` prop; loop markup.
- [ ] **Step 2:** Remove mobile `.active { border: 0 }`; add inactive opacity + active left border.

### Task 3: Verify

- [ ] **Step 1:** Run `npm run build`
- [ ] **Step 2:** Manual spot-check `/`, `/experiments`, `/projects`, `/about` (desktop + mobile widths)
