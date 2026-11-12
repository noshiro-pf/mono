---
'eslint-plugin-ts-data-forge': minor
---

Every rule treats what `ts-data-forge` re-exports from `ts-std-forge` the same whichever package it is imported from. `no-unnecessary-type-guard` now checks `isRecord` imported from `ts-std-forge`, and the fixes of `prefer-is-non-null-object`, `prefer-is-record-and-has-key`, `prefer-num-safe-parse-int`, `prefer-num-safe-parse-float`, `prefer-obj-over-entries-round-trip` and the other rules that write such a name reuse an import of it from `ts-std-forge` instead of offering no fix.
