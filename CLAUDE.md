# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"Memento Mori" life calendar: a static page that draws one square per week of an expected lifespan and fills in the weeks already lived. Plain HTML/CSS/JS with no build step, no dependencies, no tests, and no package manager.

## Running

Open `index.html` directly in a browser (`file://` works — there are no fetches or modules). Both query params are required; without them the page renders nothing useful:

```
index.html?dob=1990-05-17&age=80
```

- `dob` — date of birth, `YYYY-MM-DD`
- `age` — life expectancy in years; only whole decades are rendered (`Math.floor(age / 10)`)

The layout is designed to print to A4 portrait (`@page` + `-webkit-print-color-adjust: exact` so filled cells survive printing).

## Architecture

`script.js` runs top-to-bottom on load in two phases: `populate_calendar()` builds the DOM, then `fill_calendar()` paints it. There is no state, no framework, no re-render — changing the date means reloading the page.

Grid structure, from outside in:

- `#calendar` — CSS grid, 2 columns of rectangles
- **decade** — a pair of `.rect-container` rectangles (`rect-<decade>-<0|1>`); each pair is 10 years
- **rectangle** — `--rows-per-rect` × `--cols-per-rect` cells (10 × 26 = one half-year-per-row block)
- **cell** — `.week-cell`, one week, addressed by a flat `week-<n>` id where `n` counts weeks from birth

The DOM order of cells does *not* match chronological order: a rectangle is filled row-major, but week `n` for a given row lives half in rect 0 and half in rect 1. `set_ids()` is what reconciles the two, computing the chronological id from `(decade, rect, index)`. Any change to the grid shape must keep `set_ids()`, the CSS variables, and `paint_week()`'s id lookup in sync.

## CSS/JS coupling

`--rows-per-rect` and `--cols-per-rect` are read out of `:root` by `get_css_variable()` and used as *numbers* in JS layout math. They are the single source of truth for grid dimensions — change them in `styles.css`, not in `script.js`. Note that `get_css_variable()` returns a string, so arithmetic on these values relies on JS coercion; `+` will concatenate rather than add.

Colors are likewise pulled from CSS variables at paint time (`--color-dark-gray` marks a lived week).
