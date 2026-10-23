---
'eslint-plugin-synstate': minor
---

Add `no-write-during-propagation`, enabled at `error` by the `recommended` preset. It reports a write to a synstate state or source (a `createState` setter, `updateState`, `resetState`, a `createReducer` dispatch, the `createBooleanState` utilities, an emitter, `next` of a `source()`) made directly in a subscriber or in a projection inside `.pipe(...)`. Such a write starts an update inside the one that called it, so it is not part of the graph synstate orders: subscribers can see intermediate states, and a write back into the same update loops. Derive the value with `pipe` instead.
