---
'synstate': minor
'synstate-preact-hooks': minor
'synstate-preact-signals': minor
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
---

Add the `keepEqualParts` option of `createState`, `createReducer` and `createBooleanState`, and the `keepEqualParts()` operator. With `keepEqualParts: true`, an update is compared with the current state before it is written: every part deeply equal to the same part of the current state is kept as that part, and an update deeply equal to the whole state is not passed on at all, so a state written whole from a server's answer hands a new object only to the readers of what changed. `keepEqualParts: { key }` matches array items by key rather than by index. The `keepEqualParts()` operator does the same to a stream, for a source that is not yours to change; prefer the option, which keeps references where the value is written so that nothing downstream has anything to undo.

`synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the operator is exported from them as well.
