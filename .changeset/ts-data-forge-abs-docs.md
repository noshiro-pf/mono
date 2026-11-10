---
'ts-data-forge': patch
---

The `abs` documentation of `Int8` and of `NegativeInt`, `NegativeSafeInt` and `NegativeFiniteNumber` now names the type it returns (`AbsoluteValue<N>` for `Int8`, whose `abs(-128)` is `128`; the positive type for the negative ones) instead of saying the result keeps the module's brand.
