---
'ts-data-forge': patch
---

`Arr.toFilled` returns `[]` for an empty array, in both forms, instead of throwing `TypeError: Expected a positive integer in [1, 2^32), got: 0`.
