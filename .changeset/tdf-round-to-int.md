---
'ts-data-forge': patch
---

`Num.roundToInt` rounds as `Math.round` does, so a negative number rounds to the nearest integer: `Num.roundToInt(-2.3)` is `-2` (was `-1`) and `Num.roundToInt(-2.6)` is `-3` (was `-2`). `Num.round(digit)`, built on it, now agrees with `Num.roundAt` for a negative number, and `Num.roundToInt(0.49999999999999994)` is `0` (was `1`).
