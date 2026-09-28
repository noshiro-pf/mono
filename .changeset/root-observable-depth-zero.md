---
'synstate': patch
---

Type `depth` as `0` on `RootObservable` and `InitializedRootObservable`, as it
was meant to be. The conditional compared the whole `ObservableKind` union with
`'root'` instead of the observable's own kind, so it always resolved to
`number`. Child observables keep `number`, and nothing changes at runtime.
