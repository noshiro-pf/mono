---
'synstate': minor
'synstate-preact-signals': minor
'synstate-preact-hooks': minor
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
---

Add an `equals` option to `createState`, `createReducer` and `createBooleanState`. When it says the next state equals the current one, the update is not passed on — no subscriber, and nothing derived from the state, is told of it — and the current state is kept, so `setState` and the like return it. Without the option every update is passed on, as before; the next major makes `Object.is` the default.
