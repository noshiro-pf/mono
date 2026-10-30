---
'synstate': patch
---

A write to an observable that nothing observes — no derived observable and no subscriber — stores the value and returns, instead of opening, draining and closing an update with nobody to reach. Such a write (a branch no `switchMap` follows, a state written before anything subscribes to it or derives from it) takes less than half the time it did. It still gets an `updateToken` of its own.

`setState`, `updateState` and `resetState` no longer build an action object for every write: `createState` writes to its source directly, sharing with `createReducer` the comparison against `equals` and `keepEqualParts`.
