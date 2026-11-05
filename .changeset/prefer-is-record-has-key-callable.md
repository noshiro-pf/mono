---
'eslint-rule-forge': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-record-and-has-key` fixes `Object.hasOwn(obj, key)` into `isRecord(obj) && hasKey(obj, key)` only when type information shows that `obj` cannot be a function at any layer of type wrappers: no call or construct signature, and not `object`, `unknown`, `any`, `Function` or a type parameter constrained by one of them. `isRecord` rejects every function, which `Object.hasOwn` accepts (`Object.hasOwn(fn, 'name')`, a class's static members), so the fix turned those from `true` to `false`. Elsewhere, and without type information, the rewrite is a suggestion that says so.
