# Experiments sidebar — numbered nav header — design spec

**Branch:** `feat/content-structure-hybrid`  
**Status:** Implemented  
**Date:** 2026-09-29  

## Summary

Add a static **Pick an experiment** header to the floating experiments sidebar, and **number each featured link** (`01`, `02`, …) using the same markup pattern as main nav (`span` index + label). Main content **`h1`** remains the **dynamic experiment title**. Active link styling unchanged (white left border, no trailing icons).

## Sidebar structure

```
╭─────────────────────────────╮
│  Pick an experiment         │  panel header (static, not a link)
├─────────────────────────────┤
│  01  Token playground       │
│  02  …                      │
├─────────────────────────────┤
│  All experiments →          │
╰─────────────────────────────╯
```

## Header

- Copy: **Pick an experiment** only (no `01` prefix in sidebar header).
- Typography: `numbered-title` (condensed, uppercase, tracking) — user chose text-only variant.
- Element: `<p class="experiment-sidebar__header numbered-title">` inside `<nav>`.
- Not focusable; decorative section label.

## Numbered links

- Order: featured items, A–Z by title (existing sort).
- Index: local `01`…`0n` (two-digit pad for 1–99).
- Markup mirrors main nav:

```html
<button type="button" class="experiment-sidebar__link font-condensed uppercase color-white tracking-xl">
  <span class="experiment-sidebar__index" aria-hidden="true">01</span>Token playground
</button>
```

- Index span: `font-weight: 700`, `margin-right: 0.5em` (match `.nav-primary a > span`).

## Unchanged

- Panel glass, rounded right, fixed position, mobile slide-over.
- `aria-current` + white left border on selected item.
- Footer **All experiments →**.
- Main **`h1`**: dynamic title via existing index script.
- Main site nav **01 Experiments**.

## Mobile

- Toggle button label: **Pick an experiment** (replaces “Featured experiments”).

## Testing

- Sidebar shows header + numbered featured links.
- Selection and `?exp=` behavior unchanged.
- One `h1` in main with experiment title.

## Decisions log

| Decision | Choice |
|----------|--------|
| Sidebar header | Pick an experiment, no 01 prefix |
| Link numbers | Local 01…n in list order |
| Number styling | Main nav span pattern |
