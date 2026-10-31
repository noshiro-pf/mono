---
'ts-data-forge': patch
---

`Num.divInt` no longer floors its divisor. A divisor in `(-1, 1)` floored to `0` or `-1`, so `Num.divInt(5, asNonZeroFiniteNumber(0.5))` returned `Infinity` and `Num.divInt(0.3, asNonZeroFiniteNumber(0.5))` returned `NaN`, both typed as integers; they now return `10` and `0`. The result is `⌊⌊a⌋ / b⌋`, unchanged for an integer divisor. The JSDoc no longer says that division by zero returns `NaN`, since the divisor's type excludes zero.
