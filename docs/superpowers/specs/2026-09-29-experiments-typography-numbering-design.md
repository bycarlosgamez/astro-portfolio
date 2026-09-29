# Experiments typography & numbering — design spec

**Branch:** `feat/content-structure-hybrid`  
**Status:** Implemented  
**Date:** 2026-09-29  

## Summary

Single section index for experiments lives in the **sidebar header** (`01` muted + **Pick an experiment** white, compact). **Page `h1`** is the **experiment title only** (no `01`). **Sidebar links** are unnumbered. Global **numbered-title** mutes only the **first** child `span` so label text stays white (matches projects `h1`).

## Numbering hierarchy

| Layer | Numbers |
|-------|---------|
| Main nav | 00–03 |
| Sidebar header | 01 + Pick an experiment |
| Sidebar links | None |
| Page h1 | Experiment title only |

## CSS

- `.numbered-title > span:first-child` — muted index
- `.numbered-title--compact` — smaller sidebar header, nowrap + ellipsis
- `.experiment-page-title` — main column h1 (projects-scale type, no index)
