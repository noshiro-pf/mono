# synstate-dom-benchmark

Compares [synstate-dom](../../libs/synstate-dom) with Solid, Preact + Signals and VanJS on the operations of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): create, replace, partially update, select, swap, remove, append and clear rows of a table. The latest figures are in [`RESULTS.md`](./RESULTS.md).

## Running

```sh
pnpm run ws:build            # synstate-dom and synstate are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run benchmark           # rewrites RESULTS.md
```

Nothing here runs in CI: timings from a shared runner say little, and a benchmark that asserts would only be flaky.

## What is timed

Each implementation in `src/frameworks/` mounts the same table, one row per item, with the item's id and label in two cells and a `danger` class on the selected row. Before timing, `src/run.bench-browser.mts` checks that every implementation renders the same rows after the same operations.

An operation is timed from the call until one macrotask has passed and the browser has laid the table out again. The wait is there because VanJS applies changes in a `setTimeout` and Preact renders a changed list in a microtask; every implementation pays it, so it shifts all figures by the same amount, roughly the time of `select a row` for the fastest one. js-framework-benchmark itself measures up to the next paint from a Chrome trace, so figures are comparable with each other here, not with its published tables.

Libraries run as production builds (`mode: 'production'` and the `production` export condition), with the production JSX runtimes.

## How each is written

Each follows the way its own documentation or its js-framework-benchmark entry writes such a table.

- **synstate-dom**: the rows are one immutable array in a `createState`, and `For` derives each row's value from it. The selection is a state each row binds with `view`. This is the form SPEC.md recommends, not a tuned one.
- **Solid**: a signal per label, `For` over the row objects, and `createSelector` for the selection, so that selecting touches two rows. Compiled by `vite-plugin-solid`.
- **Preact + Signals**: a signal per label and a `useComputed` class per row, both bound to the DOM as signals; the list is re-rendered with keys.
- **VanJS**: a state per label and a class function per row; the list is kept by hand, moving and removing row elements directly.
