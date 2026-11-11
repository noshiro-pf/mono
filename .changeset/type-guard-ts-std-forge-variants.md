---
'eslint-plugin-ts-data-forge': minor
---

`no-unnecessary-type-guard` now checks the variant guards of `Optional`, `Result`, `TernaryResult` and `AsyncData` imported from `ts-std-forge` (by name, under an alias or through a namespace), where those types are defined, as it already did for the same guards imported from `ts-data-forge`.
