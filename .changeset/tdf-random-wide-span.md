---
'ts-data-forge': patch
---

`FiniteNumber.random()`, `NonZeroFiniteNumber.random()`, `Int.random()` and `NonZeroInt.random()` return values spread over their range. Their default bounds are `±Number.MAX_VALUE`, whose span overflows to `Infinity`, so every call returned the same bound; so did any call whose range is wider than `Number.MAX_VALUE`.
