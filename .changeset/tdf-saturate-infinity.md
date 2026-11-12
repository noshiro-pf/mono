---
'ts-data-forge': patch
---

A branded number type with two bounds saturates `+Infinity` to its `MAX_VALUE`, as its `fromNumber` documents, rather than to its `MIN_VALUE`. `FiniteNumber.mul(1e200, 1e200)` is `Number.MAX_VALUE` (was `-Number.MAX_VALUE`), `SafeInt.pow(10, 400)` is `Number.MAX_SAFE_INTEGER`, `Uint32.pow(2, 2000)` is `4294967295` and `Int16.fromNumber(Infinity)` is `32767`. `NaN` still becomes `MIN_VALUE`, which the `fromNumber` documentation now says.
