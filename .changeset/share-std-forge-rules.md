---
'eslint-plugin-ts-std-forge': minor
'eslint-plugin-ts-data-forge': patch
---

`prefer-is-non-null-object` and `prefer-is-record-and-has-key` now have one implementation. eslint-plugin-ts-std-forge exports `createPreferIsNonNullObject` and `createPreferIsRecordAndHasKey`, which build each rule for a given module name, and eslint-plugin-ts-data-forge builds its rules of the same names from them with `'ts-data-forge'`. What either plugin reports and fixes is unchanged; eslint-plugin-ts-data-forge now depends on eslint-plugin-ts-std-forge.
