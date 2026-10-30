---
'synstate': minor
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
'synstate-preact-hooks': minor
'synstate-preact-signals': minor
'synstate-dom': minor
'blueprint-synstate': minor
---

Add `derive(parents, (a, b) => …, { equals })`, which derives one value from the latest values of several observables as a single observable. It calls the projection with the parents' values as arguments, emits once every parent has a value and then whenever one of them emits, and stops a result `Object.is` the one it holds unless `equals` says otherwise. `combine(parents).pipe(map(fn))` emits the same values with two observables and a tuple built on every update; `derive` builds none. `combine` keeps emitting the tuple, now through `derive`, which makes `combine(...).pipe(map(...))` faster too. synstate-react-hooks, synstate-react-hooks-compat, synstate-preact-hooks and synstate-preact-signals re-export `derive`.

synstate-dom's `derive` now builds on it, so a value derived from several bindables is one observable, and blueprint-synstate's components use it in place of `combine` + `map`. Both now need synstate 6.1.0 or later.
