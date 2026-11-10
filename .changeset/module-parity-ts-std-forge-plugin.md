---
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-non-null-object`, `prefer-is-record-and-has-key`, `prefer-safe-number-parse` and `prefer-safe-number-parse-integer` reuse `isNonNullObject`, `isRecord`, `hasKey` or `Result` imported from `ts-data-forge`, which re-exports them unchanged, instead of offering no fix.
