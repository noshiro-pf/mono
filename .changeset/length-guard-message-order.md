---
'eslint-plugin-ts-data-forge': patch
---

The messages and descriptions of the length-guard rules, which `prefer-canonical-length-guard` reports with, put the length before the array (`Arr.isFixedLengthArray(n, xs)`, `Arr.isBoundedLengthArray(min, max, xs)`), as the functions take them and the fixes write them.
