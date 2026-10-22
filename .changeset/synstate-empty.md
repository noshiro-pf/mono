---
'synstate': minor
'synstate-preact-signals': minor
'synstate-preact-hooks': minor
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
---

Add `empty()`, an observable that holds no value and is already completed, for the branch of a `switchMap` that should follow nothing. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so `empty` reaches their users as well.
