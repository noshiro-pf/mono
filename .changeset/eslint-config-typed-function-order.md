---
'eslint-config-typed': minor
---

Add `ts-restrictions/function-order`, `error` in `eslintTsRestrictionsRules`.
It orders a module's top-level functions — `function` declarations and
`const`s initialized with a function expression:

- an exported function comes before every non-exported helper;
- a helper comes before the helpers that call it (lower-level first). Helpers
  that call each other are not ordered against each other.

A non-exported function the module refers to outside every function body (a
`main()` called at the top level, a function passed by name to `memoize(...)`)
is not a helper and stays where it is, as do types, constants and anything whose
initializer is a call (`memo(...)`). The fix moves the reported function up,
with its overload signatures and the comments directly above it; moving a
function earlier cannot change what the module does.
