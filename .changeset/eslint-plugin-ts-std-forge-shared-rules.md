---
'eslint-plugin-ts-std-forge': patch
---

Every rule but `prefer-safe-array-length-guard` is now built from the rule
factories in eslint-rule-forge, which eslint-plugin-ts-data-forge shares.
`prefer-safe-array-is-array` no longer reports a computed member such as
`Array[isArray](xs)`.
