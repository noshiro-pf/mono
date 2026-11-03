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
| create 1,000 rows               |        55.15 |  37.85 |            40.20 |  42.85 |  44.25 |  36.60 |
| replace all 1,000 rows          |        62.85 |  38.20 |            49.70 |  46.55 |  52.10 |  47.90 |
| update every 10th of 1,000 rows |        22.70 |  17.90 |            14.45 |  16.75 |  19.45 |  15.50 |
| select a row                    |         0.50 |   0.13 |             1.03 |   1.77 |   0.70 |  62.20 |
| swap two rows                   |         5.77 |   3.75 |             5.81 |   6.05 |  46.67 |   2.74 |
| remove a row                    |         8.03 |   5.29 |             7.57 |   7.26 |   6.19 |   5.58 |
| create 10,000 rows              |       504.30 | 388.55 |           556.95 | 493.85 | 745.80 | 534.45 |
| append 1,000 to 1,000 rows      |        67.60 |  43.80 |            56.35 |  54.35 |  57.15 |  60.80 |
| clear 1,000 rows                |        10.10 |   5.45 |            10.20 |  10.10 |   8.70 |   7.50 |

<!-- /benchmark -->

### Relative to synstate-dom

Each library's time divided by synstate-dom's. Below 1.00× means faster than synstate-dom; above it means slower.

<!-- benchmark:ratios -->

| operation                       | Solid | Preact + Signals | Preact | React |   VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ------: |
| create 1,000 rows               | 0.69× |            0.73× |  0.78× | 0.80× |   0.66× |
| replace all 1,000 rows          | 0.61× |            0.79× |  0.74× | 0.83× |   0.76× |
| update every 10th of 1,000 rows | 0.79× |            0.64× |  0.74× | 0.86× |   0.68× |
| select a row                    | 0.26× |            2.06× |  3.54× | 1.40× | 124.40× |
| swap two rows                   | 0.65× |            1.01× |  1.05× | 8.09× |   0.47× |
| remove a row                    | 0.66× |            0.94× |  0.90× | 0.77× |   0.69× |
| create 10,000 rows              | 0.77× |            1.10× |  0.98× | 1.48× |   1.06× |
| append 1,000 to 1,000 rows      | 0.65× |            0.83× |  0.80× | 0.85× |   0.90× |
| clear 1,000 rows                | 0.54× |            1.01× |  1.00× | 0.86× |   0.74× |

<!-- /benchmark -->

## Reading the results

In these runs, synstate-dom took between <!-- benchmark:reference-min -->1.27<!-- /benchmark -->× and <!-- benchmark:reference-max -->3.85<!-- /benchmark -->× Solid's time, depending on the operation. It is closest to Solid when updating every 10th row and creating 10,000 rows, and furthest behind when selecting a row, which takes Solid about a tenth of a millisecond; the table above shows, library by library, where it is ahead and where it falls behind.

- **Creating rows** is where having no compiler shows the most. Solid clones a compiled `<template>` for each row; synstate-dom calls `createElement` for each node and binds each dynamic leaf with its own subscription. Each row also creates a synstate node for its item (and a second for its index, which this table does not take; see `For` in [Control flow](/mono/synstate-dom/guides/control-flow/#for)), and the time to create and dispose rows grows roughly with the number of nodes.
- **Partial updates** take a different path in each implementation. Solid, Preact + Signals and VanJS hold a signal per label and write to the 100 that change. synstate-dom replaces the whole array, as the documentation recommends; every row's `item$` compares its item with the previous one, and only the 100 rows whose item changed write to the DOM. Preact and React re-render the table from the new state, and only the `memo` rows whose props changed render again.
- **Selecting a row** touches two rows in Solid, through `createSelector`, and re-renders two `memo` rows in Preact and React. In synstate-dom each row binds the selection with a `view`, so all 1,000 views run and each row's class is toggled; Preact + Signals likewise recomputes one `useComputed` per row.

## Scenarios

In js-framework-benchmark each row depends on its own data only, so the order in which a library propagates a change hardly matters. The scenarios below are screens whose figures are derived from a few inputs through a graph. In the first two, one input reaches a figure by paths of different lengths, a diamond; in the third, most changes stop at a figure that comes out the same. Each computes many figures and shows few, so that the time is mostly the propagation rather than the DOM.

- **Loan**: a 30-year loan repaid monthly, shown as one row per year and a summary (the payment, the total interest, the months to repay). Each month's interest is computed from the previous balance, the amount repaid from the previous balance and that interest, and the new balance from the previous one and the amount repaid, so the 360 months are a chain of diamonds, and the rate and the payment enter every month. Changing the rate changes every month; a prepayment in month 181 changes half the chain, and one in month 349 the last year.
- **Schedule**: the critical path of 1,000 tasks, each depending on one to three earlier ones and with a duration of its own. The forward pass gives each task's earliest start and finish, the backward pass from the end of the project its latest start, and the difference its slack. The screen shows the end of the project, the number of critical tasks and the last 50 tasks. Lengthening the first task changes nearly every figure; lengthening one in the middle changes a few dozen, because the slack of the tasks around it absorbs the change.
- **Zoom**: the labels of 10,000 places on a map, at a zoom set in steps of 0.1. The zoom gives a whole level of detail, and each label's size is computed from the level alone: a place is shown from the level of its rank on, larger at each level. The screen shows the zoom, the level, the number of labels shown and the first 50 places. Zooming within a level changes only the zoom on the screen, because the level comes out the same; zooming to the next level changes most labels.

Each scenario also times building the screen, which builds the whole graph.

<!-- benchmark:scenario-medians -->

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         7.07 |                         11.48 |  3.47 |             3.74 |   1.73 |  2.35 |  6.58 |
| loan: change the interest rate          |         1.97 |                          4.68 |  2.96 |             1.41 |   1.42 |  1.76 |  6.42 |
| loan: prepay in month 181               |         1.13 |                          2.29 |  1.16 |             0.71 |   1.12 |  0.72 | wrong |
| loan: prepay in month 349               |         0.32 |                          0.47 |  0.32 |             0.34 |   0.79 |  0.45 |  1.10 |
| schedule: build the schedule            |        24.35 |                         27.64 |  6.56 |             9.90 |   2.72 |  2.68 | 16.55 |
| schedule: lengthen the first task       |         8.54 |                         10.79 |  7.70 |             3.57 |   1.97 |  1.70 | wrong |
| schedule: lengthen a task in the middle |         0.12 |                          0.13 |  0.95 |             0.49 |   0.88 |  0.51 |  1.17 |
| schedule: lengthen a task near the end  |         0.55 |                          0.38 |  1.20 |             0.66 |   1.00 |  0.82 |  0.93 |
| zoom: build the map                     |        14.67 |                         26.25 |  8.40 |             9.05 |   2.12 |  2.57 | 23.29 |
| zoom: zoom within a level               |         0.17 |                          0.22 |  1.13 |             0.65 |   0.61 |  0.53 |  0.24 |
| zoom: zoom to the next level            |         3.38 |                          5.70 |  6.79 |             4.02 |   1.90 |  1.90 | 12.34 |

<!-- /benchmark -->

### Relative to synstate-dom (scenarios)

<!-- benchmark:scenario-ratios -->

| operation                               | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |                         1.62× | 0.49× |            0.53× |  0.24× | 0.33× | 0.93× |
| loan: change the interest rate          |                         2.38× | 1.50× |            0.72× |  0.72× | 0.89× | 3.26× |
| loan: prepay in month 181               |                         2.03× | 1.03× |            0.63× |  0.99× | 0.64× |     – |
| loan: prepay in month 349               |                         1.47× | 1.00× |            1.06× |  2.47× | 1.41× | 3.44× |
| schedule: build the schedule            |                         1.14× | 0.27× |            0.41× |  0.11× | 0.11× | 0.68× |
| schedule: lengthen the first task       |                         1.26× | 0.90× |            0.42× |  0.23× | 0.20× |     – |
| schedule: lengthen a task in the middle |                         1.08× | 7.92× |            4.08× |  7.33× | 4.25× | 9.75× |
| schedule: lengthen a task near the end  |                         0.69× | 2.18× |            1.20× |  1.82× | 1.49× | 1.69× |
| zoom: build the map                     |                         1.79× | 0.57× |            0.62× |  0.14× | 0.18× | 1.59× |
| zoom: zoom within a level               |                         1.29× | 6.65× |            3.82× |  3.59× | 3.12× | 1.41× |
| zoom: zoom to the next level            |                         1.69× | 2.01× |            1.19× |  0.56× | 0.56× | 3.65× |

<!-- /benchmark -->

### Reading the scenarios

- **Correctness comes first.** After each operation the harness compares the rendered cells with the figures a plain loop computes, and a library that rendered others is marked _wrong_ instead of timed. VanJS recomputes derived states in rounds, each rerunning the derivations that read a state the last round changed, and stops after 100 rounds; where a change has to travel further down the chain than that, it leaves stale figures on the screen. synstate-dom, Solid and Preact + Signals compute each figure once per change, after every figure it depends on.
- **React and Preact have no graph.** They keep the inputs in one state and compute every figure in a loop when they render, so a change costs one pass over the whole calculation, whatever it reaches. At this size that pass is cheap, and they are compared here as the baseline a graph has to beat.
- **Stopping at a figure that came out the same.** Solid and Preact + Signals do not pass a value on when it equals the last one. synstate-dom as written does: each figure is `combine` + `map`, which passes on every value it computes, so lengthening a task in the middle, or zooming within a level, recomputes everything downstream, though few figures change. So synstate-dom is also measured a second time with a [`skipIfNoChange`](https://noshiro-pf.github.io/mono/synstate/reference/skip-if-no-change/) after every figure. That version does stop there, at the cost of a third node per figure and so a slower build.
- **What a stop is worth depends on how a library notices a change.** A write in Solid and Preact + Signals first marks everything downstream as possibly stale, and the figures are then checked against their sources, so a change that stops at the level still visits all 10,000 labels. synstate visits only the children of a node that passed a value on, so with `skipIfNoChange` a change within a level costs the same whatever the size of the map below it. VanJS stops there too, because a state assigned the value it already has does not propagate. React and Preact keep the labels in a `useMemo` that depends on the level, and render the 51 rows again.

A change here takes well under a millisecond. As for the table's operations, the scenarios wait for the next task through a `MessageChannel`, and one sample is the mean of 20 changes, alternating the operation and its reverse.

## What is timed

In js-framework-benchmark's operations, each implementation mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, the harness checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until the next task has run and the browser has laid the table out again. The wait is there because VanJS and Preact render a change in a microtask. The harness waits through a `MessageChannel` rather than a `setTimeout`, which the browser holds back to 4 ms once timeouts are nested; that clamp would be most of what the cheaper operations are timed at. Selecting a row can take well under a millisecond, close to the 0.1 ms to which the browser rounds its clock, so one sample of each operation that changes one or two rows (selecting, swapping and removing a row) is the mean of 20 changes from the same table: the selection alternates between two rows, each swap undoes the last, and each removal takes the row that moved into the same position.

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
