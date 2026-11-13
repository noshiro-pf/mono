---
'synstate-preact-signals': patch
---

`fromSignal`'s observable no longer emits again when a signal read by one of its subscribers or operators changes: the bridge now follows the signal through its `subscribe` method, which does not track what its callback reads, instead of an `effect`, which took every signal read while the value was passed on for a dependency. This needs `@preact/signals-core` 1.2.0 or later, which every `@preact/signals` from 1.1.0 depends on; with an older core the observable still emits again, as before. `fromSignal` also reads the signal's first value with `peek`, so calling it inside an effect or a computed no longer makes that depend on the signal.
