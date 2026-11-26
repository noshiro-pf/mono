---
'ts-data-forge': patch
---

`Num.clamp` sends `+Infinity` to the upper bound and `-Infinity` to the lower one, as any value beyond them; only `NaN` still returns the lower bound. Before, every non-finite value returned the lower bound, so `Num.clamp(Infinity, 0, 100)` was `0`.
