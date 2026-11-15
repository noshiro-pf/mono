---
'synstate': minor
---

A child observable's config (`createSyncChildObservable`,
`createAsyncChildObservable`, or a subclass of `SyncChildObservableClass` /
`AsyncChildObservableClass`) takes `alsoAfter`, the observables its `tryUpdate`
reads or hears in the same update without being derived from them; the child is
made deeper than each, as it is than each parent. `withCurrentValueFrom`,
`withBufferedFrom`, `takeUntil` and `skipUntil` use it instead of computing
their depth.

A `depth` passed to that config at or below the depth of a parent, or of an
observable in `alsoAfter`, now throws at construction, naming both depths. It
was taken as given, and such a child was dropped from an update, visited out of
order, or failed with a `TypeError` that named nothing.
