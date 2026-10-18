---
'synstate': minor
---

`next` on a source with an initial value returns the value held after the call: the value passed, or, once the source is completed, the value it already holds. `dispatch` of `createReducer`, and `setState`, `updateState`, `resetState` and `toggle` of `createState` and `createBooleanState`, return what `next` returns, so after completion they give the state held instead of a value that was never applied.
