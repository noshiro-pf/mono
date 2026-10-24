---
title: Benchmark
description: synstate-dom against Solid, Preact + Signals, Preact, React and VanJS on the operations of js-framework-benchmark.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) compares synstate-dom with Solid, Preact + Signals, Preact, React and VanJS on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, replacing, partially updating, selecting, swapping, removing, appending and clearing the rows of a table.

The figures below are embedded from that app's [`RESULTS.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/RESULTS.md) and describe one machine. They compare the implementations with each other in this harness; they are not comparable with js-framework-benchmark's published tables.

## Results

<!-- benchmark:environment -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36`. Each figure is the median of 5 runs, each measuring the libraries in a different order and each itself the median of its timed runs.

<!-- /benchmark -->

### Median time

Lower is better.

<!-- benchmark:medians -->

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        23.80 |  19.50 |            19.80 |  16.30 |  19.80 |  19.90 |
| replace all 1,000 rows          |        25.50 |  19.40 |            25.80 |  23.50 |  21.70 |  22.30 |
| update every 10th of 1,000 rows |        10.30 |   8.70 |             8.90 |   9.80 |   8.80 |   9.30 |
| select a row                    |         4.60 |   4.30 |             4.40 |   4.20 |   4.50 |  23.20 |
| swap two rows                   |         6.90 |   4.90 |             5.30 |   4.90 |  19.00 |   5.00 |
| remove a row                    |         5.80 |   5.40 |             4.90 |   5.00 |   5.30 |   4.80 |
| create 10,000 rows              |       226.70 | 186.10 |           238.00 | 197.50 | 365.40 | 209.40 |
| append 1,000 to 1,000 rows      |        27.30 |  22.20 |            25.30 |  24.20 |  23.00 |  24.90 |
| clear 1,000 rows                |         7.70 |   5.90 |             5.10 |   4.20 |   6.30 |   6.30 |

<!-- /benchmark -->

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1.00× is faster than synstate-dom, above it slower.

<!-- benchmark:ratios -->

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.82× |            0.83× |  0.68× | 0.83× | 0.84× |
| replace all 1,000 rows          | 0.76× |            1.01× |  0.92× | 0.85× | 0.87× |
| update every 10th of 1,000 rows | 0.84× |            0.86× |  0.95× | 0.85× | 0.90× |
| select a row                    | 0.93× |            0.96× |  0.91× | 0.98× | 5.04× |
| swap two rows                   | 0.71× |            0.77× |  0.71× | 2.75× | 0.72× |
| remove a row                    | 0.93× |            0.84× |  0.86× | 0.91× | 0.83× |
| create 10,000 rows              | 0.82× |            1.05× |  0.87× | 1.61× | 0.92× |
| append 1,000 to 1,000 rows      | 0.81× |            0.93× |  0.89× | 0.84× | 0.91× |
| clear 1,000 rows                | 0.77× |            0.66× |  0.55× | 0.82× | 0.82× |

<!-- /benchmark -->

## Reading the results

In these runs, synstate-dom took between <!-- benchmark:reference-min -->1.07<!-- /benchmark -->× and <!-- benchmark:reference-max -->1.41<!-- /benchmark -->× Solid's time, depending on the operation. It is not the fastest at any of them; the table above shows where it is ahead of another library and where it is behind.

- **Creating rows** is where the absence of a compiler shows most. Solid clones a compiled `<template>` for each row; synstate-dom calls `createElement` for each node and binds each dynamic leaf with its own subscription. Each row also creates two synstate nodes, for its item and its index (see `For` in [Control flow](/mono/synstate-dom/guides/control-flow/#for)), and the time to create and dispose rows grows roughly with the number of nodes.
- **Partial updates** take different paths. Solid, Preact + Signals and VanJS hold a signal per label and write to the 100 that change. synstate-dom replaces the whole array, as the documentation recommends; every row's `item$` compares its item with the previous one, and only the 100 rows whose item changed write to the DOM. Preact and React re-render the table from the new state, and only the `memo` rows whose props changed render again.
- **Selecting a row** touches two rows in Solid, through `createSelector`, and re-renders two `memo` rows in Preact and React. In synstate-dom each row binds the selection with a `view`, so all 1,000 views run and each row's class is toggled; Preact + Signals likewise recomputes one `useComputed` per row.

## What is timed

Each implementation mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, the harness checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. The wait is there because VanJS applies changes in a `setTimeout` and Preact renders a changed list in a microtask. Every implementation pays it, so it shifts all figures by about the same amount.

Libraries run as production builds (`mode: 'production'` and the `production` export condition) with their production JSX runtimes, in headless Chromium under Vitest's browser mode.

## How each is written

Each follows the way its own documentation, or its js-framework-benchmark entry, writes such a table.

- **synstate-dom**: the rows are one immutable array in a `createState`, and `For` derives each row's value from it. The selection is a state each row binds with `view`. This is the form the documentation recommends, not a tuned one.
- **Solid**: a signal per label, `For` over the row objects, and `createSelector` for the selection, so that selecting touches two rows. Compiled by `vite-plugin-solid`.
- **Preact + Signals**: a signal per label and a `useComputed` class per row, both bound to the DOM as signals; the list is re-rendered with keys.
- **Preact** and **React**: the rows and the selection are one immutable state in a `useState` at the top, and each row is a `memo` component given its label and whether it is selected. React renders each change with `flushSync`; Preact renders it in a microtask.
- **VanJS**: a state per label and a class function per row; the list is kept by hand, moving and removing row elements directly.

## Running it

Nothing here runs in CI: timings from a shared runner say little, and a benchmark that asserted would only be flaky. One run differs from the next by 10–30% on the same machine, so the figures here come from `benchmark:repeat`, the median of several runs.

```sh
pnpm run ws:build            # synstate-dom and synstate are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run benchmark:repeat    # the median of 5 runs; rewrites RESULTS.md
cd ../synstate-dom-docs
pnpm run gen:benchmark       # embeds RESULTS.md into this page
```
