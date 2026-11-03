---
'eslint-rule-forge': minor
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-non-null-object` (eslint-plugin-ts-data-forge and eslint-plugin-ts-std-forge) and the `createPreferIsNonNullObject` factory it is built from (eslint-rule-forge) no longer report, or rewrite, `typeof u === 'object' && u !== null` when `u` is a global or a `declare`d name. `typeof window === 'object' && window !== null` returns `false` where `window` does not exist, while `isNonNullObject(window)` throws a `ReferenceError`. The other order, `u !== null && typeof u === 'object'`, already reads `u` and is fixed as before, as is either order on a name the file creates at runtime — a variable, a parameter, a value import.

eslint-rule-forge also exports `isRuntimeBound(sourceCode, node, name)`, which tells whether a name read at a node is a value the file creates at runtime rather than a global, a `declare`d name, a type-only import or a `const enum`.
