# synstate-dom-benchmark

Compares [synstate-dom](../../libs/synstate-dom) with Solid, Preact + Signals, Preact, React and VanJS on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): create, replace, partially update, select, swap, remove, append and clear rows of a table. It also compares them on two [scenarios](#scenarios) whose figures depend on each other through diamonds of many lengths: a loan amortization table and a project schedule. The latest figures are in [`RESULTS.md`](./RESULTS.md).

## Running

```sh
pnpm run ws:build            # synstate-dom and synstate are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run benchmark           # one run; rewrites RESULTS.md
pnpm run benchmark:repeat    # the median of 5 runs; rewrites RESULTS.md
```

One run differs from the next by 10–30% on the same machine, so figures worth quoting come from `benchmark:repeat`. It measures the libraries in a different order on each run, and adds a table of each library's time relative to synstate-dom's. `--runs <n>` sets the number of runs. `--baseline <git ref>` also builds that ref in a temporary worktree and runs its benchmark alternately with this tree's, then prints each library's median before and after; the libraries that did not change show how much the machine moved.

Nothing here runs in CI: timings from a shared runner say little, and a benchmark that asserts would only be flaky.

## What is timed

Each implementation in `src/frameworks/` mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, `src/run.bench-browser.mts` checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. The wait is there because VanJS and Preact render a change in a microtask; every implementation pays it, so it shifts all figures by the same amount, roughly the time of `select a row` for the fastest one. js-framework-benchmark itself measures up to the next paint from a Chrome trace, so figures are comparable with each other here, not with its published tables.

Libraries run as production builds (`mode: 'production'` and the `production` export condition), with the production JSX runtimes.

## How each is written

Each follows the way its own documentation or its js-framework-benchmark entry writes such a table.

- **synstate-dom**: the rows are one immutable array in a `createState`, and `For` derives each row's value from it. The selection is a state each row binds with `view`. This is the form SPEC.md recommends, not a tuned one.
- **Solid**: a signal per label, `For` over the row objects, and `createSelector` for the selection, so that selecting touches two rows. Compiled by `vite-plugin-solid`.
- **Preact + Signals**: a signal per label and a `useComputed` class per row, both bound to the DOM as signals; the list is re-rendered with keys.
- **Preact** and **React**: the rows and the selection are one immutable state in a `useState` at the top, and each row is a `memo` component given its label and whether it is selected, so that a change re-renders the rows whose props changed. Each change is rendered with `flushSync` in React; Preact renders it in a microtask.
- **VanJS**: a state per label and a class function per row; the list is kept by hand, moving and removing row elements directly.

## Scenarios

In js-framework-benchmark each row depends on its own data only. The scenarios under `src/scenarios/` are screens whose figures are derived from a few inputs through a graph: in the loan and the schedule one input reaches a figure by paths of different lengths, and in the zoom most changes stop at a figure that comes out the same. They compute many figures and show few, so that what is timed is mostly the propagation rather than the DOM.

- **Loan** (`loan/`): a 30-year loan repaid monthly. Each month's interest comes from the previous balance, the amount repaid from the previous balance and that interest, and the new balance from the previous one and the amount repaid, so the 360 months are a chain of diamonds; the rate and the payment enter every month. The screen shows a summary (payment, total interest, months to repay) and one row per year. The operations change the rate (every month changes) and enter a prepayment in month 181 (half the chain) or 349 (the last year).
- **Schedule** (`schedule/`): the critical path of 1,000 tasks, each depending on one to three of the twenty before it, with a duration of its own. The forward pass gives each task's earliest start and finish, the backward pass from the end of the project its latest start, and the difference its slack; the screen shows the end of the project, the number of critical tasks and the last 50 tasks. The operations lengthen the first task (nearly every figure changes), one in the middle (the slack of the tasks around it absorbs the change, so a few dozen figures change) and one near the end.
- **Zoom** (`zoom/`): the labels of 10,000 places at a zoom set in steps of 0.1. The zoom gives a whole level of detail, and each label's size comes from the level alone. The screen shows the zoom, the level, the number of labels shown and the first 50 places. The operations zoom within a level (the level comes out the same, so only the zoom on the screen changes) and to the next level (most labels change). Solid and Preact + Signals mark every label as possibly stale on each write before checking it, while synstate visits only the children of a node that passed a value on.

Each scenario also times `mount`, which builds the whole graph.

`src/scenarios/*/model.mts` computes every figure in one loop. React and Preact call it when they render; the signal-based libraries make one derived value per figure, each computed with the same function as the loop's, so that every library renders the same digits. After each operation the harness compares the rendered cells with the model's, and a library that rendered others gets `wrong` instead of a time: VanJS recomputes derived states in rounds, each rerunning the derivations that read a state the last one changed, and stops after 100, so a change that has to travel further down a chain than that leaves stale figures.

A change here costs well under a millisecond, less than the 4 ms to which the browser holds a nested `setTimeout`, so the scenarios wait for the next task through a `MessageChannel` instead. And since `performance.now()` is rounded to 0.1 ms, one sample is the mean of 20 changes, alternating the operation and its reverse, which reach the same figures; a build sample is the mean of 5 mounts.

synstate-dom is measured twice. As written, each figure is `combine` + `map`, which passes on every value it computes, so an update goes on through figures that came out the same. With a `skipIfNoChange` after every figure, it stops there, as Solid and Preact + Signals do by default, at the cost of a third node per figure.
