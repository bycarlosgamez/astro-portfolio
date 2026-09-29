# Experiments responsive layout — design spec

**Status:** Implemented  
**Date:** 2026-09-29  

## Summary

Shared CSS variables on `body.experiments` sync sidebar width and main-column offset. Three tiers: mobile drawer + sticky bottom bar; tablet fixed slim sidebar (45–63em); desktop 20rem sidebar (≥63em). Content max-width scales by tier to reduce overlap.

## Variables

| Tier | Viewport | `--experiment-sidebar-width` | `--experiment-content-max` |
|------|----------|------------------------------|----------------------------|
| Mobile | &lt; 45em | 0 | 48rem |
| Tablet | 45–62.99em | min(16rem, 38vw) | 40rem |
| Desktop | ≥ 63em | 20rem | 48rem |

## Mobile

Sticky bottom **Pick an experiment** bar opens slide-over panel. Extra main `padding-bottom` clears the bar.

## Main column

`margin-inline-start` and `width` use `var(--experiment-sidebar-width)` + `var(--experiment-layout-gutter)` from 45em up.
