---
title: Benchmark
description: synstate-dom against Solid, Preact + Signals, Preact, React and VanJS on the operations of js-framework-benchmark and on three screens whose figures are derived from each other through a graph.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) compares synstate-dom with Solid, Preact + Signals, Preact, React and VanJS on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, replacing, partially updating, selecting, swapping, removing, appending and clearing the rows of a table. It also compares them on three [scenarios](#scenarios) whose figures are derived from each other through a graph: two with diamonds of many lengths, and one in which most changes stop partway.

The figures below are embedded from that app's [`RESULTS.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/RESULTS.md) and come from a single machine. They are for comparing the implementations with each other in this harness, not with js-framework-benchmark's published tables.

## Results

<!-- benchmark:environment -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/157.0.8103.78 Safari/537.36`. Each figure is the median of 5 runs, each measuring the libraries in a different order and each itself the median of its timed runs.

<!-- /benchmark -->

### Median time

Lower is better.

<!-- benchmark:medians -->

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        19.90 |  18.20 |            19.40 |  17.40 |  18.70 |  17.90 |
| replace all 1,000 rows          |        21.30 |  19.00 |            25.70 |  21.30 |  22.20 |  19.40 |
| update every 10th of 1,000 rows |         7.90 |   7.60 |             8.10 |   8.30 |   8.00 |   8.20 |
| select a row                    |         4.20 |   4.20 |             5.50 |   4.30 |   4.60 |  34.80 |
| swap two rows                   |         4.70 |   4.40 |             5.30 |   5.10 |  17.90 |   5.00 |
| remove a row                    |         5.80 |   4.80 |             5.80 |   5.00 |   5.60 |   5.40 |
| create 10,000 rows              |       191.70 | 154.10 |           214.60 | 173.70 | 357.30 | 188.60 |
| append 1,000 to 1,000 rows      |        22.40 |  18.60 |            22.80 |  22.50 |  23.40 |  23.40 |
| clear 1,000 rows                |         6.00 |   5.70 |             4.70 |   4.20 |   6.70 |   5.10 |

<!-- /benchmark -->

### Relative to synstate-dom

Each library's time divided by synstate-dom's. Below 1.00× means faster than synstate-dom; above it means slower.

<!-- benchmark:ratios -->

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.91× |            0.97× |  0.87× | 0.94× | 0.90× |
| replace all 1,000 rows          | 0.89× |            1.21× |  1.00× | 1.04× | 0.91× |
| update every 10th of 1,000 rows | 0.96× |            1.03× |  1.05× | 1.01× | 1.04× |
| select a row                    | 1.00× |            1.31× |  1.02× | 1.10× | 8.29× |
| swap two rows                   | 0.94× |            1.13× |  1.09× | 3.81× | 1.06× |
| remove a row                    | 0.83× |            1.00× |  0.86× | 0.97× | 0.93× |
| create 10,000 rows              | 0.80× |            1.12× |  0.91× | 1.86× | 0.98× |
| append 1,000 to 1,000 rows      | 0.83× |            1.02× |  1.00× | 1.04× | 1.04× |
| clear 1,000 rows                | 0.95× |            0.78× |  0.70× | 1.12× | 0.85× |

<!-- /benchmark -->

### Slowest operation of each library

How far behind each library falls at its worst: its slowest operation, as a multiple of the fastest library's time on that operation. The [synstate benchmark](/mono/synstate/comparison/benchmark/#summary) judges speed the same way.

<!-- benchmark:worst-cases -->

| library          | slowest operation          | × the fastest library |
| :--------------- | :------------------------- | --------------------: |
| synstate-dom     | clear 1,000 rows           |                 1.43× |
| Solid            | clear 1,000 rows           |                 1.36× |
| Preact + Signals | create 10,000 rows         |                 1.39× |
| Preact           | append 1,000 to 1,000 rows |                 1.21× |
| React            | swap two rows              |                 4.07× |
| VanJS            | select a row               |                 8.29× |

<!-- /benchmark -->

## Reading the results

synstate-dom aims at a simple API with decent speed that rarely turns slow, rather than at the top of every row. Its slowest operation takes <!-- benchmark:worst/synstate-dom -->1.43<!-- /benchmark -->× the fastest library's time: <!-- benchmark:placement/behind -->behind Solid, Preact and Preact + Signals<!-- /benchmark -->, and well ahead of React (<!-- benchmark:worst/react -->4.07<!-- /benchmark -->×) and VanJS (<!-- benchmark:worst/vanjs -->8.29<!-- /benchmark -->×).

In these runs, synstate-dom took between <!-- benchmark:reference-min -->1.00<!-- /benchmark -->× and <!-- benchmark:reference-max -->1.24<!-- /benchmark -->× Solid's time, depending on the operation. It is close to the fastest where only a few rows change (updating every 10th row, selecting a row) and furthest behind where many rows are created; the tables above show, library by library, where it is ahead and where it falls behind.

- **Creating rows** is where having no compiler shows the most. Solid clones a compiled `<template>` for each row; synstate-dom calls `createElement` for each node and binds each dynamic leaf with its own subscription. Each row also creates synstate nodes: the state `For` keeps for its item (and one for its index, which this table does not take; see `For` in [Control flow](/mono/synstate-dom/guides/control-flow/#for)), a `map` node for its label and the node `selector` gives it for its class, and the time to create and dispose rows grows roughly with the number of nodes.
- **Partial updates** take a different path in each implementation. Solid, Preact + Signals and VanJS hold a signal per label and write to the 100 that change. synstate-dom replaces the whole array, as the documentation recommends; `For` sets the state of each row whose item is not the one it holds, and only the 100 rows whose item changed write to the DOM. Preact and React re-render the table from the new state, and only the `memo` rows whose props changed render again.
- **Selecting a row** touches two rows in Solid, through `createSelector`, and re-renders two `memo` rows in Preact and React. synstate-dom's `selector` writes only to the two rows whose selection changed, as `createSelector` does; Preact + Signals recomputes one `useComputed` per row.

## Scenarios

In js-framework-benchmark each row depends on its own data only, so the order in which a library propagates a change hardly matters. The scenarios below are screens whose figures are derived from a few inputs through a graph. In the first two, one input reaches a figure by paths of different lengths, a diamond; in the third, most changes stop at a figure that comes out the same. Each computes many figures and shows few, so that the time is mostly the propagation rather than the DOM.

- **Loan**: a 30-year loan repaid monthly, shown as one row per year and a summary (the payment, the total interest, the months to repay). Each month's interest is computed from the previous balance, the amount repaid from the previous balance and that interest, and the new balance from the previous one and the amount repaid, so the 360 months are a chain of diamonds, and the rate and the payment enter every month. Changing the rate changes every month; a prepayment in month 181 changes half the chain, and one in month 349 the last year.
- **Schedule**: the critical path of 1,000 tasks, each depending on one to three earlier ones and with a duration of its own. The forward pass gives each task's earliest start and finish, the backward pass from the end of the project its latest start, and the difference its slack. The screen shows the end of the project, the number of critical tasks and the last 50 tasks. Lengthening the first task changes nearly every figure; lengthening one in the middle changes a few dozen, because the slack of the tasks around it absorbs the change.
- **Zoom**: the labels of 10,000 places on a map, at a zoom set in steps of 0.1. The zoom gives a whole level of detail, and each label's size is computed from the level alone: a place is shown from the level of its rank on, larger at each level. The screen shows the zoom, the level, the number of labels shown and the first 50 places. Zooming within a level changes only the zoom on the screen, because the level comes out the same; zooming to the next level changes most labels.

Each scenario also times building the screen, which builds the whole graph.

<!-- benchmark:scenario-medians -->

| operation (median ms)                   | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         1.28 |  1.16 |             1.26 |   0.74 |  0.70 |  1.72 |
| loan: change the interest rate          |         0.58 |  0.78 |             0.59 |   0.51 |  0.47 |  2.03 |
| loan: prepay in month 181               |         0.28 |  0.39 |             0.31 |   0.35 |  0.28 | wrong |
| loan: prepay in month 349               |         0.07 |  0.11 |             0.10 |   0.17 |  0.13 |  0.38 |
| schedule: build the schedule            |         2.88 |  2.58 |             3.88 |   1.30 |  1.16 |  6.24 |
| schedule: lengthen the first task       |         1.01 |  2.70 |             1.21 |   0.78 |  0.74 | wrong |
| schedule: lengthen a task in the middle |         0.03 |  0.53 |             0.22 |   0.26 |  0.21 |  0.47 |
| schedule: lengthen a task near the end  |         0.13 |  0.53 |             0.30 |   0.39 |  0.34 |  0.28 |
| zoom: build the map                     |         4.06 |  2.52 |             3.80 |   1.04 |  0.96 |  8.68 |
| zoom: zoom within a level               |         0.06 |  0.61 |             0.32 |   0.26 |  0.24 |  0.07 |
| zoom: zoom to the next level            |         1.23 |  2.69 |             1.51 |   0.79 |  0.78 |  4.19 |

<!-- /benchmark -->

### Relative to synstate-dom (scenarios)

<!-- benchmark:scenario-ratios -->

| operation                               |  Solid | Preact + Signals | Preact | React |  VanJS |
| :-------------------------------------- | -----: | ---------------: | -----: | ----: | -----: |
| loan: build the table                   |  0.91× |            0.98× |  0.58× | 0.55× |  1.34× |
| loan: change the interest rate          |  1.34× |            1.02× |  0.88× | 0.81× |  3.50× |
| loan: prepay in month 181               |  1.39× |            1.11× |  1.25× | 1.00× |      – |
| loan: prepay in month 349               |  1.57× |            1.43× |  2.43× | 1.86× |  5.43× |
| schedule: build the schedule            |  0.90× |            1.35× |  0.45× | 0.40× |  2.17× |
| schedule: lengthen the first task       |  2.67× |            1.20× |  0.77× | 0.73× |      – |
| schedule: lengthen a task in the middle | 17.67× |            7.33× |  8.67× | 7.00× | 15.67× |
| schedule: lengthen a task near the end  |  4.08× |            2.31× |  3.00× | 2.62× |  2.15× |
| zoom: build the map                     |  0.62× |            0.94× |  0.26× | 0.24× |  2.14× |
| zoom: zoom within a level               | 10.17× |            5.33× |  4.33× | 4.00× |  1.17× |
| zoom: zoom to the next level            |  2.19× |            1.23× |  0.64× | 0.63× |  3.41× |

<!-- /benchmark -->

### Reading the scenarios

- **Correctness comes first.** After each operation the harness compares the rendered cells with the figures a plain loop computes, and a library that rendered others is marked _wrong_ instead of timed. VanJS recomputes derived states in rounds, each rerunning the derivations that read a state the last round changed, and stops after 100 rounds; where a change has to travel further down the chain than that, it leaves stale figures on the screen. synstate-dom, Solid and Preact + Signals compute each figure once per change, after every figure it depends on.
- **React and Preact have no graph.** They keep the inputs in one state and compute every figure in a loop when they render, so a change costs one pass over the whole calculation, whatever it reaches. At this size that pass is cheap, and they are compared here as the baseline a graph has to beat.
- **Stopping at a figure that came out the same.** Solid and Preact + Signals do not pass a value on when it equals the last one, and neither does synstate's `map`: a figure computed from others is a `map`, or a `derive` where it has several inputs, so lengthening a task in the middle, or zooming within a level, stops at the figures that came out the same.
- **What a stop is worth depends on how a library notices a change.** A write in Solid and Preact + Signals first marks everything downstream as possibly stale, and the figures are then checked against their sources, so a change that stops at the level still visits all 10,000 labels. synstate visits only the children of a node that passed a value on, so a change within a level costs the same whatever the size of the map below it. VanJS stops there too, because a state assigned the value it already has does not propagate. React and Preact keep the labels in a `useMemo` that depends on the level, and render the 51 rows again.

A change here takes well under a millisecond. The scenarios therefore wait for the next task through a `MessageChannel` rather than a `setTimeout`, which the browser holds back to 4 ms, and one sample is the mean of 20 changes, alternating the operation and its reverse.

## What is timed

In js-framework-benchmark's operations, each implementation mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, the harness checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. The wait is there because VanJS and Preact render a change in a microtask. Every implementation pays it, so it shifts all figures by about the same amount.

Libraries run as production builds (`mode: 'production'` and the `production` export condition) with their production JSX runtimes, in headless Chromium under Vitest's browser mode.

## How each is written

Each follows the way its own documentation, or its js-framework-benchmark entry, writes such a table.

- **synstate-dom**: the rows are one immutable array in a `state`, `For` keeps a state per row, and the selection is a `selector`, which writes only to the rows whose selection changed. A transformed binding is written `pipe(map(...))`. This is the form the documentation recommends, not a tuned one.
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
