---
title: Benchmark
description: synstate-dom against Solid, Preact + Signals, Preact, React and VanJS on the operations of js-framework-benchmark and on three screens whose figures are derived from each other through a graph.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) compares synstate-dom with Solid, Preact + Signals, Preact, React and VanJS on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, replacing, partially updating, selecting, swapping, removing, appending and clearing the rows of a table. It also compares them on three [scenarios](#scenarios) whose figures are derived from each other through a graph: two with diamonds of many lengths, and one in which most changes stop partway.

The figures below are embedded from that app's [`RESULTS.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/RESULTS.md) and come from a single machine. They are for comparing the implementations with each other in this harness, not with js-framework-benchmark's published tables.

## Results

<!-- benchmark:environment -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 8 runs, each measuring the libraries in a different order and each itself the median of its timed runs.

<!-- /benchmark -->

### Median time

Lower is better.

<!-- benchmark:medians -->

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        24.85 |  19.70 |            22.95 |  20.95 |  23.70 |  23.20 |
| replace all 1,000 rows          |        31.10 |  21.75 |            30.15 |  25.75 |  27.70 |  24.85 |
| update every 10th of 1,000 rows |         9.95 |   9.85 |            10.65 |  10.75 |  10.45 |   9.95 |
| select a row                    |         4.60 |   4.40 |             5.70 |   4.80 |   4.90 |  39.10 |
| swap two rows                   |         7.80 |   5.65 |             6.45 |   6.10 |  21.40 |   5.90 |
| remove a row                    |         6.45 |   5.40 |             6.05 |   5.70 |   5.50 |   5.15 |
| create 10,000 rows              |       280.00 | 178.95 |           265.00 | 220.05 | 461.00 | 240.30 |
| append 1,000 to 1,000 rows      |        34.90 |  24.00 |            29.45 |  27.80 |  28.40 |  28.00 |
| clear 1,000 rows                |         8.10 |   6.05 |             5.60 |   6.75 |   6.95 |   6.55 |

<!-- /benchmark -->

### Relative to synstate-dom

Each library's time divided by synstate-dom's. Below 1.00× means faster than synstate-dom; above it means slower.

<!-- benchmark:ratios -->

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.79× |            0.92× |  0.84× | 0.95× | 0.93× |
| replace all 1,000 rows          | 0.70× |            0.97× |  0.83× | 0.89× | 0.80× |
| update every 10th of 1,000 rows | 0.99× |            1.07× |  1.08× | 1.05× | 1.00× |
| select a row                    | 0.96× |            1.24× |  1.04× | 1.07× | 8.50× |
| swap two rows                   | 0.72× |            0.83× |  0.78× | 2.74× | 0.76× |
| remove a row                    | 0.84× |            0.94× |  0.88× | 0.85× | 0.80× |
| create 10,000 rows              | 0.64× |            0.95× |  0.79× | 1.65× | 0.86× |
| append 1,000 to 1,000 rows      | 0.69× |            0.84× |  0.80× | 0.81× | 0.80× |
| clear 1,000 rows                | 0.75× |            0.69× |  0.83× | 0.86× | 0.81× |

<!-- /benchmark -->

### Slowest operation of each library

How far behind each library falls at its worst: its slowest operation, as a multiple of the fastest library's time on that operation. The [SynState benchmark](/mono/synstate/guides/library-comparison/benchmark/#how-to-read-this-page) judges speed the same way.

<!-- benchmark:worst-cases -->

| library          | slowest operation  | × the fastest library |
| :--------------- | :----------------- | --------------------: |
| synstate-dom     | create 10,000 rows |                 1.56× |
| Solid            | clear 1,000 rows   |                 1.08× |
| Preact + Signals | create 10,000 rows |                 1.48× |
| Preact           | create 10,000 rows |                 1.23× |
| React            | swap two rows      |                 3.79× |
| VanJS            | select a row       |                 8.89× |

<!-- /benchmark -->

## Reading the results

synstate-dom aims at a simple API with decent speed that rarely turns slow, rather than at the top of every row. Its slowest operation takes <!-- benchmark:worst/synstate-dom -->1.56<!-- /benchmark -->× the fastest library's time: <!-- benchmark:placement/behind -->behind Solid, Preact and Preact + Signals<!-- /benchmark -->, and well ahead of React (<!-- benchmark:worst/react -->3.79<!-- /benchmark -->×) and VanJS (<!-- benchmark:worst/vanjs -->8.89<!-- /benchmark -->×).

In these runs, synstate-dom took between <!-- benchmark:reference-min -->1.01<!-- /benchmark -->× and <!-- benchmark:reference-max -->1.56<!-- /benchmark -->× Solid's time, depending on the operation. It is close to the fastest where only a few rows change (updating every 10th row, selecting a row) and furthest behind where many rows are created; the tables above show, library by library, where it is ahead and where it falls behind.

- **Creating rows** is where having no compiler shows the most. Solid clones a compiled `<template>` for each row; synstate-dom calls `createElement` for each node and binds each dynamic leaf with its own subscription. Each row also creates synstate nodes: one for its item (and one for its index, which this table does not take; see `For` in [Control flow](/mono/synstate-dom/guides/control-flow/#for)) and a `map` node for each of its two bindings, and the time to create and dispose rows grows roughly with the number of nodes.
- **Partial updates** take a different path in each implementation. Solid, Preact + Signals and VanJS hold a signal per label and write to the 100 that change. synstate-dom replaces the whole array, as the documentation recommends; every row's `item$` compares its item with the previous one, and only the 100 rows whose item changed write to the DOM. Preact and React re-render the table from the new state, and only the `memo` rows whose props changed render again.
- **Selecting a row** touches two rows in Solid, through `createSelector`, and re-renders two `memo` rows in Preact and React. In synstate-dom each row binds the selection through a `map` node, so all 1,000 of them run, and only the two whose result changed pass it on and have their class toggled; Preact + Signals likewise recomputes one `useComputed` per row.

## Scenarios

In js-framework-benchmark each row depends on its own data only, so the order in which a library propagates a change hardly matters. The scenarios below are screens whose figures are derived from a few inputs through a graph. In the first two, one input reaches a figure by paths of different lengths, a diamond; in the third, most changes stop at a figure that comes out the same. Each computes many figures and shows few, so that the time is mostly the propagation rather than the DOM.

- **Loan**: a 30-year loan repaid monthly, shown as one row per year and a summary (the payment, the total interest, the months to repay). Each month's interest is computed from the previous balance, the amount repaid from the previous balance and that interest, and the new balance from the previous one and the amount repaid, so the 360 months are a chain of diamonds, and the rate and the payment enter every month. Changing the rate changes every month; a prepayment in month 181 changes half the chain, and one in month 349 the last year.
- **Schedule**: the critical path of 1,000 tasks, each depending on one to three earlier ones and with a duration of its own. The forward pass gives each task's earliest start and finish, the backward pass from the end of the project its latest start, and the difference its slack. The screen shows the end of the project, the number of critical tasks and the last 50 tasks. Lengthening the first task changes nearly every figure; lengthening one in the middle changes a few dozen, because the slack of the tasks around it absorbs the change.
- **Zoom**: the labels of 10,000 places on a map, at a zoom set in steps of 0.1. The zoom gives a whole level of detail, and each label's size is computed from the level alone: a place is shown from the level of its rank on, larger at each level. The screen shows the zoom, the level, the number of labels shown and the first 50 places. Zooming within a level changes only the zoom on the screen, because the level comes out the same; zooming to the next level changes most labels.

Each scenario also times building the screen, which builds the whole graph.

<!-- benchmark:scenario-medians -->

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         2.71 |                          5.72 |  1.57 |             1.76 |   0.99 |  0.97 |  2.26 |
| loan: change the interest rate          |         0.96 |                          1.32 |  1.10 |             0.87 |   0.74 |  0.69 |  2.92 |
| loan: prepay in month 181               |         0.53 |                          0.69 |  0.61 |             0.45 |   0.46 |  0.42 | wrong |
| loan: prepay in month 349               |         0.13 |                          0.13 |  0.14 |             0.14 |   0.25 |  0.23 |  0.65 |
| schedule: build the schedule            |        11.07 |                         15.59 |  3.51 |             3.94 |   1.91 |  1.56 |  9.69 |
| schedule: lengthen the first task       |         3.30 |                          3.97 |  4.00 |             1.82 |   1.11 |  1.07 | wrong |
| schedule: lengthen a task in the middle |         0.06 |                          0.07 |  0.84 |             0.31 |   0.36 |  0.33 |  0.65 |
| schedule: lengthen a task near the end  |         0.20 |                          0.22 |  0.85 |             0.47 |   0.59 |  0.54 |  0.40 |
| zoom: build the map                     |         7.62 |                         14.69 |  3.39 |             4.34 |   1.36 |  1.32 | 10.85 |
| zoom: zoom within a level               |         0.08 |                          0.07 |  0.69 |             0.48 |   0.37 |  0.31 |  0.09 |
| zoom: zoom to the next level            |         2.40 |                          2.91 |  3.26 |             1.92 |   1.12 |  1.12 |  5.94 |

<!-- /benchmark -->

### Relative to synstate-dom (scenarios)

<!-- benchmark:scenario-ratios -->

| operation                               | synstate-dom (skipIfNoChange) |  Solid | Preact + Signals | Preact | React |  VanJS |
| :-------------------------------------- | ----------------------------: | -----: | ---------------: | -----: | ----: | -----: |
| loan: build the table                   |                         2.11× |  0.58× |            0.65× |  0.37× | 0.36× |  0.83× |
| loan: change the interest rate          |                         1.38× |  1.15× |            0.91× |  0.77× | 0.72× |  3.04× |
| loan: prepay in month 181               |                         1.30× |  1.15× |            0.85× |  0.87× | 0.79× |      – |
| loan: prepay in month 349               |                         1.00× |  1.08× |            1.08× |  1.92× | 1.77× |  5.00× |
| schedule: build the schedule            |                         1.41× |  0.32× |            0.36× |  0.17× | 0.14× |  0.88× |
| schedule: lengthen the first task       |                         1.20× |  1.21× |            0.55× |  0.34× | 0.32× |      – |
| schedule: lengthen a task in the middle |                         1.17× | 14.00× |            5.17× |  6.00× | 5.50× | 10.83× |
| schedule: lengthen a task near the end  |                         1.10× |  4.25× |            2.35× |  2.95× | 2.70× |  2.00× |
| zoom: build the map                     |                         1.93× |  0.44× |            0.57× |  0.18× | 0.17× |  1.42× |
| zoom: zoom within a level               |                         0.88× |  8.63× |            6.00× |  4.63× | 3.88× |  1.13× |
| zoom: zoom to the next level            |                         1.21× |  1.36× |            0.80× |  0.47× | 0.47× |  2.48× |

<!-- /benchmark -->

### Reading the scenarios

- **Correctness comes first.** After each operation the harness compares the rendered cells with the figures a plain loop computes, and a library that rendered others is marked _wrong_ instead of timed. VanJS recomputes derived states in rounds, each rerunning the derivations that read a state the last round changed, and stops after 100 rounds; where a change has to travel further down the chain than that, it leaves stale figures on the screen. synstate-dom, Solid and Preact + Signals compute each figure once per change, after every figure it depends on.
- **React and Preact have no graph.** They keep the inputs in one state and compute every figure in a loop when they render, so a change costs one pass over the whole calculation, whatever it reaches. At this size that pass is cheap, and they are compared here as the baseline a graph has to beat.
- **Stopping at a figure that came out the same.** Solid and Preact + Signals do not pass a value on when it equals the last one, and neither does synstate's `map`: each figure is `combine` + `map`, so lengthening a task in the middle, or zooming within a level, stops at the figures that came out the same. The second synstate-dom column, with a [`skipIfNoChange`](https://noshiro-pf.github.io/mono/synstate/reference/skip-if-no-change/) after every figure, dates from before `map` stopped there; it now stops at the same place and only adds a third node per figure, and so a slower build.
- **What a stop is worth depends on how a library notices a change.** A write in Solid and Preact + Signals first marks everything downstream as possibly stale, and the figures are then checked against their sources, so a change that stops at the level still visits all 10,000 labels. synstate visits only the children of a node that passed a value on, so a change within a level costs the same whatever the size of the map below it. VanJS stops there too, because a state assigned the value it already has does not propagate. React and Preact keep the labels in a `useMemo` that depends on the level, and render the 51 rows again.

A change here takes well under a millisecond. The scenarios therefore wait for the next task through a `MessageChannel` rather than a `setTimeout`, which the browser holds back to 4 ms, and one sample is the mean of 20 changes, alternating the operation and its reverse.

## What is timed

In js-framework-benchmark's operations, each implementation mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, the harness checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. The wait is there because VanJS and Preact render a change in a microtask. Every implementation pays it, so it shifts all figures by about the same amount.

Libraries run as production builds (`mode: 'production'` and the `production` export condition) with their production JSX runtimes, in headless Chromium under Vitest's browser mode.

## How each is written

Each follows the way its own documentation, or its js-framework-benchmark entry, writes such a table.

- **synstate-dom**: the rows are one immutable array in a `createState`, and `For` derives each row's value from it. The selection is a state each row binds through `pipe(map(...))`, as every transformed binding is written. This is the form the documentation recommends, not a tuned one.
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
