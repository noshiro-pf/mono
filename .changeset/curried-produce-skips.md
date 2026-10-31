---
'eslint-config-typed': patch
---

`immer-coding-style/prefer-curried-produce` leaves four wrappers alone that its rewrite to `produce(recipe)` broke: an async one (`async (s) => produce(s, recipe)`), which returns a `Promise` of the next state where the curried form returns the state itself; a generic one (`<S extends State>(s: S) => …`), whose type parameter the rewrite dropped; one whose base is under `!` (`produce(s!, recipe)`), whose curried form would take only the narrowed type; and one whose parameter is optional (`(s?: State) => …`), which the curried form would require.
