---
'synstate': patch
---

The README and the `createSyncChildObservable` example use `derive` where they used `combine`: `derive(parents, (a, b) => ...)` computes one value from several observables in one step, and `combine` is `derive` with a projection that collects the values. The `createSyncChildObservable` description no longer says `map`, `filter` and `combine` are built with it; it wraps the base class they extend.
