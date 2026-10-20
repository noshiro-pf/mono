---
'synstate': minor
---

`createRootObservable`'s `init` receives an `onComplete` tool that registers a teardown from inside `init`, so a creator such as `fromEvent` no longer has to keep its listener outside `init` for the teardown to reach it. It replaces the `onComplete` field of `RootObservableConfig`, which is removed. Registered teardowns run once, in the order registered; one registered after the observable has completed runs at once.
