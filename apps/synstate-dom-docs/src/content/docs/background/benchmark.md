---
title: Benchmark
description: synstate-dom against Solid, Preact + Signals, Preact, React and VanJS on the operations of js-framework-benchmark and on two screens whose figures depend on each other through diamonds.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) compares synstate-dom with Solid, Preact + Signals, Preact, React and VanJS on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, replacing, partially updating, selecting, swapping, removing, appending and clearing the rows of a table. It also compares them on two [scenarios](#scenarios) whose figures depend on each other through diamonds of many lengths.

The figures below are embedded from that app's [`RESULTS.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/RESULTS.md) and describe one machine. They compare the implementations with each other in this harness; they are not comparable with js-framework-benchmark's published tables.

## Results

<!-- benchmark:environment -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36`. Each figure is the median of 8 runs, each measuring the libraries in a different order and each itself the median of its timed runs.

<!-- /benchmark -->

### Median time

Lower is better.

<!-- benchmark:medians -->

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        22.75 |  18.30 |            18.20 |  17.15 |  19.55 |  20.25 |
| replace all 1,000 rows          |        24.90 |  19.65 |            25.00 |  23.10 |  22.05 |  21.65 |
| update every 10th of 1,000 rows |         9.85 |   8.00 |             7.90 |   9.30 |   7.90 |   7.85 |
| select a row                    |         4.60 |   4.20 |             4.40 |   4.30 |   4.50 |  26.15 |
| swap two rows                   |         6.10 |   4.50 |             4.95 |   5.05 |  18.50 |   4.45 |
| remove a row                    |         5.45 |   4.80 |             5.10 |   5.10 |   5.20 |   4.95 |
| create 10,000 rows              |       229.40 | 174.00 |           251.35 | 215.05 | 376.05 | 220.15 |
| append 1,000 to 1,000 rows      |        26.90 |  21.25 |            24.25 |  23.90 |  23.50 |  23.95 |
| clear 1,000 rows                |         7.60 |   5.80 |             5.90 |   4.20 |   6.15 |   6.30 |

<!-- /benchmark -->

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1.00× is faster than synstate-dom, above it slower.

<!-- benchmark:ratios -->

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.80× |            0.80× |  0.75× | 0.86× | 0.89× |
| replace all 1,000 rows          | 0.79× |            1.00× |  0.93× | 0.89× | 0.87× |
| update every 10th of 1,000 rows | 0.81× |            0.80× |  0.94× | 0.80× | 0.80× |
| select a row                    | 0.91× |            0.96× |  0.93× | 0.98× | 5.68× |
| swap two rows                   | 0.74× |            0.81× |  0.83× | 3.03× | 0.73× |
| remove a row                    | 0.88× |            0.94× |  0.94× | 0.95× | 0.91× |
| create 10,000 rows              | 0.76× |            1.10× |  0.94× | 1.64× | 0.96× |
| append 1,000 to 1,000 rows      | 0.79× |            0.90× |  0.89× | 0.87× | 0.89× |
| clear 1,000 rows                | 0.76× |            0.78× |  0.55× | 0.81× | 0.83× |

<!-- /benchmark -->

## Reading the results

In these runs, synstate-dom took between <!-- benchmark:reference-min -->1.10<!-- /benchmark -->× and <!-- benchmark:reference-max -->1.36<!-- /benchmark -->× Solid's time, depending on the operation. It is not the fastest at any of them; the table above shows where it is ahead of another library and where it is behind.

- **Creating rows** is where the absence of a compiler shows most. Solid clones a compiled `<template>` for each row; synstate-dom calls `createElement` for each node and binds each dynamic leaf with its own subscription. Each row also creates a synstate node for its item (and a second for its index, which this table does not take; see `For` in [Control flow](/mono/synstate-dom/guides/control-flow/#for)), and the time to create and dispose rows grows roughly with the number of nodes.
- **Partial updates** take different paths. Solid, Preact + Signals and VanJS hold a signal per label and write to the 100 that change. synstate-dom replaces the whole array, as the documentation recommends; every row's `item$` compares its item with the previous one, and only the 100 rows whose item changed write to the DOM. Preact and React re-render the table from the new state, and only the `memo` rows whose props changed render again.
- **Selecting a row** touches two rows in Solid, through `createSelector`, and re-renders two `memo` rows in Preact and React. In synstate-dom each row binds the selection with a `view`, so all 1,000 views run and each row's class is toggled; Preact + Signals likewise recomputes one `useComputed` per row.

## Scenarios

In js-framework-benchmark each row depends on its own data only, so the order in which a library propagates a change hardly matters. The two scenarios below are screens whose figures are derived from a few inputs through a graph in which one input reaches a figure by paths of different lengths, a diamond. Each computes many figures and shows few, so that the time is mostly the propagation rather than the DOM.

- **Loan**: a 30-year loan repaid monthly, shown as one row per year and a summary (the payment, the total interest, the months to repay). Each month's interest is computed from the previous balance, the amount repaid from the previous balance and that interest, and the new balance from the previous one and the amount repaid, so the 360 months are a chain of diamonds, and the rate and the payment enter every month. Changing the rate changes every month; a prepayment in month 181 changes half the chain, and one in month 349 the last year.
- **Schedule**: the critical path of 1,000 tasks, each depending on one to three earlier ones and with a duration of its own. The forward pass gives each task's earliest start and finish, the backward pass from the end of the project its latest start, and the difference its slack. The screen shows the end of the project, the number of critical tasks and the last 50 tasks. Lengthening the first task changes nearly every figure; lengthening one in the middle changes a few dozen, because the slack of the tasks around it absorbs the change.

Each scenario also times building the screen, which builds the whole graph.

<!-- benchmark:scenario-medians -->

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         1.87 |                          2.61 |  1.09 |             1.49 |   0.86 |  0.79 |  1.83 |
| loan: change the interest rate          |         1.04 |                          1.16 |  0.77 |             0.64 |   0.54 |  0.50 |  1.92 |
| loan: prepay in month 181               |         0.56 |                          0.61 |  0.43 |             0.34 |   0.34 |  0.30 | wrong |
| loan: prepay in month 349               |         0.11 |                          0.12 |  0.11 |             0.10 |   0.20 |  0.14 |  0.38 |
| schedule: build the schedule            |         6.32 |                          8.07 |  2.81 |             3.72 |   1.45 |  1.36 |  6.08 |
| schedule: lengthen the first task       |         2.54 |                          2.78 |  2.53 |             1.29 |   0.82 |  0.79 | wrong |
| schedule: lengthen a task in the middle |         1.46 |                          0.07 |  0.52 |             0.21 |   0.26 |  0.23 |  0.42 |
| schedule: lengthen a task near the end  |         1.19 |                          0.17 |  0.55 |             0.33 |   0.41 |  0.36 |  0.30 |

<!-- /benchmark -->

### Relative to synstate-dom (scenarios)

<!-- benchmark:scenario-ratios -->

| operation                               | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |                         1.40× | 0.58× |            0.80× |  0.46× | 0.42× | 0.98× |
| loan: change the interest rate          |                         1.12× | 0.74× |            0.62× |  0.52× | 0.48× | 1.85× |
| loan: prepay in month 181               |                         1.09× | 0.77× |            0.61× |  0.61× | 0.54× |     – |
| loan: prepay in month 349               |                         1.09× | 1.00× |            0.91× |  1.82× | 1.27× | 3.45× |
| schedule: build the schedule            |                         1.28× | 0.44× |            0.59× |  0.23× | 0.22× | 0.96× |
| schedule: lengthen the first task       |                         1.09× | 1.00× |            0.51× |  0.32× | 0.31× |     – |
| schedule: lengthen a task in the middle |                         0.05× | 0.36× |            0.14× |  0.18× | 0.16× | 0.29× |
| schedule: lengthen a task near the end  |                         0.14× | 0.46× |            0.28× |  0.34× | 0.30× | 0.25× |

<!-- /benchmark -->

### Reading the scenarios

- **Correctness comes first.** After each operation the harness compares the rendered cells with the figures a plain loop computes, and a library that rendered others is marked _wrong_ instead of timed. VanJS recomputes derived states in rounds, each rerunning the derivations that read a state the last round changed, and stops after 100 rounds; where a change has to travel further down the chain than that, it leaves stale figures on the screen. synstate-dom, Solid and Preact + Signals compute each figure once per change, after every figure it depends on.
- **React and Preact have no graph.** They keep the inputs in one state and compute every figure in a loop when they render, so a change costs one pass over the whole calculation, whatever it reaches. At this size that pass is cheap, and they are compared here as the baseline a graph has to beat.
- **Stopping at a figure that came out the same.** Solid and Preact + Signals do not pass a value on when it equals the last one. synstate-dom as written does: each figure is `combine` + `map`, which passes on every value it computes, so lengthening a task in the middle recomputes everything downstream, though few figures change. It is measured a second time with a [`skipIfNoChange`](https://noshiro-pf.github.io/mono/synstate/reference/skip-if-no-change/) after every figure, which stops there, at the cost of a third node per figure and so a slower build.

A change here takes well under a millisecond. The scenarios therefore wait for the next task through a `MessageChannel` rather than a `setTimeout`, which the browser holds back to 4 ms, and one sample is the mean of 20 changes, alternating the operation and its reverse.

## What is timed

In js-framework-benchmark's operations, each implementation mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, the harness checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. The wait is there because VanJS and Preact render a change in a microtask. Every implementation pays it, so it shifts all figures by about the same amount.

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
