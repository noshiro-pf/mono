---
'eslint-plugin-ts-data-forge': patch
---

`prefer-is-non-null-object`, `prefer-is-record-and-has-key`,
`prefer-arr-is-array`, `prefer-num-safe-parse-int`,
`prefer-num-safe-parse-float` and `no-side-effect-import` are now built from the
rule factories in eslint-rule-forge, which eslint-plugin-ts-std-forge shares.
`prefer-arr-is-array`, `prefer-num-safe-parse-int` and
`prefer-num-safe-parse-float` now also read the callee through type wrappers
(`(Number as NumberConstructor)(s)`, `(Array.isArray satisfies unknown)(xs)`),
and `prefer-arr-is-array` replaces the parentheses around a callee along with
it and no longer reports `Array[isArray](xs)`.
