---
'synstate': minor
---

`createSyncChildObservable`, `createInitializedSyncChildObservable` and `createAsyncChildObservable` take an `init` callback whose tools include `onComplete`, as `createRootObservable`'s do, and `init` may return `{ tryUpdate, canEmitNoMore, flush }` (`SyncChildObservableHooks` / `AsyncChildObservableHooks`) instead of `tryUpdate` alone. The state an operator needs lives inside `init`, next to its teardown and hooks; the config keeps only `parents`, `depth` and `initialValue`, and `AsyncChildObservableConfig` is gone. An operator that completes itself in `init` (a `takeUntil` whose notifier already holds a value) is no longer registered to its parents.
