---
title: Benchmark
description: synstate-dom-next against synstate-dom and Solid on the operations of js-framework-benchmark and on three screens whose figures are derived from each other through a graph.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) times UI libraries on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, replacing, partially updating, selecting, swapping, removing, appending and clearing the rows of a table. It also times three [scenarios](#scenarios) whose figures are derived from each other through a graph. Its `benchmark:next` set measures synstate-dom-next against synstate-dom, the generation it is to replace, and Solid, the fastest library that benchmark measures; the comparison with Preact + Signals, Preact, React and VanJS is on [synstate-dom's site](https://noshiro-pf.github.io/mono/synstate-dom/background/benchmark/).

The figures below are embedded from that app's [`RESULTS-NEXT.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/RESULTS-NEXT.md) and come from a single machine. They are for comparing the implementations with each other in this harness, not with js-framework-benchmark's published tables.

## Results

<!-- benchmark:environment -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 5 runs, each measuring the libraries in a different order and each itself the median of its timed runs.

<!-- /benchmark -->

### Median time

Lower is better.

<!-- benchmark:medians -->

| operation (median ms)           | synstate-dom | synstate-dom-next |  Solid |
| :------------------------------ | -----------: | ----------------: | -----: |
| create 1,000 rows               |        27.90 |             26.70 |  22.40 |
| replace all 1,000 rows          |        32.20 |             30.20 |  23.00 |
| update every 10th of 1,000 rows |        10.20 |              9.30 |   9.20 |
| select a row                    |         4.70 |              4.20 |   4.30 |
| swap two rows                   |         5.50 |              5.50 |   5.50 |
| remove a row                    |         6.10 |              5.30 |   5.40 |
| create 10,000 rows              |       297.20 |            243.30 | 205.60 |
| append 1,000 to 1,000 rows      |        33.10 |             29.00 |  26.20 |
| clear 1,000 rows                |         8.00 |              6.20 |   6.20 |

<!-- /benchmark -->

### Relative to synstate-dom

Each library's time divided by synstate-dom's. Below 1.00× means faster than synstate-dom; above it means slower.

<!-- benchmark:ratios -->

| operation                       | synstate-dom-next | Solid |
| :------------------------------ | ----------------: | ----: |
| create 1,000 rows               |             0.96× | 0.80× |
| replace all 1,000 rows          |             0.94× | 0.71× |
| update every 10th of 1,000 rows |             0.91× | 0.90× |
| select a row                    |             0.89× | 0.91× |
| swap two rows                   |             1.00× | 1.00× |
| remove a row                    |             0.87× | 0.89× |
| create 10,000 rows              |             0.82× | 0.69× |
| append 1,000 to 1,000 rows      |             0.88× | 0.79× |
| clear 1,000 rows                |             0.78× | 0.78× |

<!-- /benchmark -->

## Reading the results

synstate-dom-next took <!-- benchmark:next-over-dom-min -->0.78<!-- /benchmark -->× to <!-- benchmark:next-over-dom-max -->1.00<!-- /benchmark -->× synstate-dom's time, and at most <!-- benchmark:next-over-solid-max -->1.31<!-- /benchmark -->× Solid's, depending on the operation.

- **Creating and clearing rows** costs less per row. A row's bindings are one object each instead of a closure, a subscriber and a cleanup, and removing a row disposes its owner with no completion to send through its nodes ([How it works](/mono/synstate-dom-next/background/how-it-works/#why-it-is-faster-than-synstate-dom)). What remains between it and Solid is template cloning: Solid clones a compiled `<template>` per row, where synstate-dom-next calls `createElement` for each node.
- **Partial updates** replace the whole array, as the documentation recommends. The keys are the same, so `For` skips the diff and sets each element into its row's state; the 900 rows whose element is the same object stop at the state itself, since the value did not change, and only the 100 changed rows reach their bindings.
- **Selecting a row** writes to two rows through `selector`, as Solid's `createSelector` does; synstate-dom ran a `map` in each of the 1,000 rows.
- **Swapping two rows** moves two rows in every library, so there is little for a library to save.

## Scenarios

In js-framework-benchmark each row depends on its own data only, so the order in which a library propagates a change hardly matters. The scenarios below are screens whose figures are derived from a few inputs through a graph. In the first two, one input reaches a figure by paths of different lengths, a diamond; in the third, most changes stop at a figure that comes out the same. Each computes many figures and shows few, so that the time is mostly the propagation rather than the DOM.

- **Loan**: a 30-year loan repaid monthly, shown as one row per year and a summary. Each month's interest is computed from the previous balance, the amount repaid from the previous balance and that interest, and the new balance from the previous one and the amount repaid, so the 360 months are a chain of diamonds. Changing the rate changes every month; a prepayment in month 181 changes half the chain, and one in month 349 the last year.
- **Schedule**: the critical path of 1,000 tasks, each depending on one to three earlier ones. The forward pass gives each task's earliest start and finish, the backward pass its latest start, and the difference its slack. Lengthening the first task changes nearly every figure; lengthening one in the middle changes a few dozen, because the slack of the tasks around it absorbs the change.
- **Zoom**: the labels of 10,000 places on a map, at a zoom set in steps of 0.1. The zoom gives a level of detail, and each label's size is computed from the level alone. Zooming within a level changes only the zoom on the screen, because the level comes out the same; zooming to the next level changes most labels.

Each scenario also times building the screen, which builds the whole graph. **synstate-dom (derive)** is synstate-dom-next's code written with synstate and synstate-dom, every figure one `derive` or `map`, so that the gap between it and synstate-dom-next is the libraries' and not the way the figures are written.

<!-- benchmark:scenario-medians -->

| operation (median ms)                   | synstate-dom | synstate-dom (derive) | synstate-dom-next | Solid |
| :-------------------------------------- | -----------: | --------------------: | ----------------: | ----: |
| loan: build the table                   |         2.80 |                  3.04 |              1.64 |  1.56 |
| loan: change the interest rate          |         0.89 |                  0.79 |              0.68 |  1.11 |
| loan: prepay in month 181               |         0.48 |                  0.44 |              0.40 |  0.57 |
| loan: prepay in month 349               |         0.13 |                  0.12 |              0.11 |  0.14 |
| schedule: build the schedule            |        11.56 |                  8.68 |              3.82 |  3.72 |
| schedule: lengthen the first task       |         2.48 |                  1.68 |              1.30 |  3.52 |
| schedule: lengthen a task in the middle |         0.06 |                  0.05 |              0.05 |  0.63 |
| schedule: lengthen a task near the end  |         0.17 |                  0.19 |              0.17 |  0.76 |
| zoom: build the map                     |         8.06 |                  8.36 |              3.60 |  3.14 |
| zoom: zoom within a level               |         0.09 |                  0.08 |              0.08 |  0.56 |
| zoom: zoom to the next level            |         2.23 |                  2.30 |              1.72 |  3.31 |

<!-- /benchmark -->

### Relative to synstate-dom (scenarios)

<!-- benchmark:scenario-ratios -->

| operation                               | synstate-dom (derive) | synstate-dom-next |  Solid |
| :-------------------------------------- | --------------------: | ----------------: | -----: |
| loan: build the table                   |                 1.09× |             0.59× |  0.56× |
| loan: change the interest rate          |                 0.89× |             0.76× |  1.25× |
| loan: prepay in month 181               |                 0.92× |             0.83× |  1.19× |
| loan: prepay in month 349               |                 0.92× |             0.85× |  1.08× |
| schedule: build the schedule            |                 0.75× |             0.33× |  0.32× |
| schedule: lengthen the first task       |                 0.68× |             0.52× |  1.42× |
| schedule: lengthen a task in the middle |                 0.83× |             0.83× | 10.50× |
| schedule: lengthen a task near the end  |                 1.12× |             1.00× |  4.47× |
| zoom: build the map                     |                 1.04× |             0.45× |  0.39× |
| zoom: zoom within a level               |                 0.89× |             0.89× |  6.22× |
| zoom: zoom to the next level            |                 1.03× |             0.77× |  1.48× |

<!-- /benchmark -->

### Reading the scenarios

- **Building a screen** builds a node per figure. synstate-dom-next takes <!-- benchmark:build-next-over-dom-min -->0.33<!-- /benchmark -->× synstate-dom's time at best, because a node is a class instance with its methods on a prototype and its owner keeps it in a plain list.
- **A change that stops partway** (lengthening a task in the middle, zooming within a level) is cheap for both generations of synstate, which visit only the children of a node that passed a value on; Solid first marks everything downstream as possibly stale and then checks it.
- **A change that travels far** (changing the rate, lengthening the first task, zooming to the next level) is where the scheduler's cost per node shows: no object allocated to mark an update, one queue driven by an integer, and each node visited once.
- **Correctness comes first.** After each operation the harness compares the rendered cells with the figures a plain loop computes, and a library that rendered others is marked _wrong_ instead of timed.

A change here takes well under a millisecond, so the scenarios wait for the next task through a `MessageChannel` rather than a `setTimeout`, which the browser holds back to 4 ms, and one sample is the mean of 20 changes, alternating the operation and its reverse.

## What is timed

In js-framework-benchmark's operations, each implementation mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, the harness checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. Every implementation pays the wait, so it shifts all figures by about the same amount.

Libraries run as production builds (`mode: 'production'` and the `production` export condition) with their production JSX runtimes, in headless Chromium under Vitest's browser mode.

## How each is written

- **synstate-dom-next**: the rows are one immutable array in a `state`, `For` keeps a state per row, and `selector` writes only the two rows whose selection changed. In the scenarios each figure is one `derive` or `map`, both of which pass on only a value that changed.
- **synstate-dom**: the rows are one immutable array in a `createState`, and `For` derives each row's value from it. The selection is a state each row binds through `pipe(map(...))`.
- **Solid**: a signal per label, `For` over the row objects, and `createSelector` for the selection. Compiled by `vite-plugin-solid`.

## Running it

Nothing here runs in CI: timings from a shared runner say little, and a benchmark that asserted would only be flaky. One run differs from the next by 10–30% on the same machine, so the figures here come from `benchmark:repeat`, the median of several runs.

```sh
pnpm run ws:build                     # the libraries are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run benchmark:repeat -- --next   # the median of 5 runs; rewrites RESULTS-NEXT.md
cd ../synstate-dom-next-docs
pnpm run gen:benchmark                # embeds RESULTS-NEXT.md into the pages
```
