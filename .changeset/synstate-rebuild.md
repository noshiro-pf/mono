---
'synstate': major
'synstate-preact-hooks': major
'synstate-preact-signals': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

synstate is rebuilt from scratch. An update is computed glitch-free in depth order, each node at most once, and a node whose value comes out `Object.is` equal stops the update there; subscribers and other effects run once every value of the update is up to date, and a write made while values are recomputed starts the next update instead of nesting. The breaking changes, each with what to write instead, are on the documentation's [Changes from synstate 9](https://noshiro-pf.github.io/mono/synstate/background/changes-from-synstate/) page. The ones every program meets:

- `subscribe(fn)` calls `fn` at once with the current value, if there is one, and returns the function that unsubscribes; `Subscription` is gone (`Unsubscribe` is its type).
- A source is written with `.emit`, `.set` or `.update` rather than `.next`, and the setters of `createState` and the other helpers return nothing.
- Observables no longer complete. A node ends by being disposed with the owner it was created in (`createOwner`, `createRootOwner`, `getOwner`, `onCleanup`, `dispose()`), and `settled` says whether one will emit again.
- `combine` is replaced by `derive`; `mapTo`, `pluck` and `unwrapResultOk` are gone, each one `map`. Since `map` now stops a result `Object.is` equal to the last, `mapTo(c)` becomes `map(() => c, { equals: () => false })`, or it emits once.

The bindings for React, Preact and Preact Signals follow the new API and take synstate as a peer dependency rather than a dependency of their own: install `synstate` beside them. synstate refuses to build one graph from two copies of itself, which a pinned dependency would install beside the application's own.
