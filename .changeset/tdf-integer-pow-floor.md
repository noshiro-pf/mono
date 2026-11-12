---
'ts-data-forge': patch
---

The integer branded types' `pow` floors a fractional result, as its documentation says and as `div` does: `SafeInt.pow(2, -1)` is `0` (was `1`, rounded from `0.5`) and `Int16.pow(-2, -1)` is `-1` (was `-0`). `Int8` and `Uint8` do the same.
