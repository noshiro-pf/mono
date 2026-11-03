---
'ts-data-forge': minor
---

New `Num.rem(a, b)`: `a % b`, with the divisor typed as `NonZeroNumber` (as `Num.isNonZero` narrows it) or a non-zero numeric literal, as `Num.div` takes it, since `a % 0` is `NaN`.
