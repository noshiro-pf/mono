---
'eslint-config-typed': patch
---

`immer-coding-style/mut-prefixed-draft` reports only the recipe of immer's own `produce` / `produceWithPatches` — a named, aliased, default or namespace import from `immer` that nothing nearer shadows — as `prefer-curried-produce` already did. A `produce` from another module, a local one, a parameter shadowing the import and one with no import at all are left alone; a namespace call (`immer.produce(state, (draft) => …)`) is now reported too.
