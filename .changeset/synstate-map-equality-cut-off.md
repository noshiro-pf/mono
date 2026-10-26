---
'synstate': major
'synstate-preact-hooks': major
'synstate-preact-signals': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

`map` no longer passes on a result equal to the one it holds, so a derived value that did not change wakes nothing below it — what `skipIfNoChange()` after a `map` did, without the extra observable. The comparison is `Object.is`; `map(fn, { equals })` replaces it. The mapping function no longer receives an index either, so a `map` no longer counts its updates.

Migrating:

- A `map` that turns events into a value that can repeat — `click$.pipe(map(() => true))`, a request mapped to the id it is for, a `map` run for its side effect that returns nothing — now emits only when the value changes. Use `mapTo(value)`, which still emits on every event, or pass `{ equals: () => false }`.
- `map((x, i) => ...)` becomes `.pipe(withIndex()).pipe(map(([i, x]) => ...))`. `withIndex` (alias `attachIndex`) still gives `-1` to a value the source already holds.
- `.pipe(map(fn)).pipe(skipIfNoChange())` can drop the `skipIfNoChange()`.

`mapTo` takes its value as a `const` type parameter, so `mapTo('reset')` is typed `'reset'` without `as const`. Where the wider type is wanted, widen the value: `mapTo(1 as number)`.
