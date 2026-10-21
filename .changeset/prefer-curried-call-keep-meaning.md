---
'eslint-config-typed': patch
---

`ts-restrictions/prefer-curried-call` no longer rewrites a call that has explicit type arguments, which the fix used to drop (`(a) => f<T>(a, 1)` → `f(1)`). It also no longer rewrites one whose callee has side effects, which the curried form would evaluate once instead of on every call (`(a) => getF()(a, 1)` → `getF()(1)`).
