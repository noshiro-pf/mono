---
'synstate': patch
---

`merge` is no longer typed as an `InitializedObservable` when one of its sources is initialized. It holds no value until a source emits, even when its sources hold one, so `merge([state$, events$]).getSnapshot().value` type-checked as the value type and read `undefined` until a source emitted. What `merge` returns is now always typed as an uninitialized `Observable`, so code that needs the initialized type from it no longer compiles; pipe `withInitialValue` after `merge` where a value is needed from the start.
