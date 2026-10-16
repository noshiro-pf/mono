---
'eslint-config-typed': patch
'eslint-plugin-ts-type-forge': patch
---

Take the shared rule helpers (type wrappers, parentheses, import resolution) from the new `eslint-rule-forge` package instead of a copy in this one. The rules behave as before.
