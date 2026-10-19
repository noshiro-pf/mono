---
'ts-data-forge': minor
---

`range` and `Arr.range` now accept any non-zero step for non-negative bounds and still type the result as `SafeUint`. A negative step only counts down from `start` towards `end`, so every value stays non-negative; the overload used to ask for a positive step, so `range(asSafeUint(n), 0, -1)` fell through to the general overload and gave `SafeInt`. A call with non-negative bounds and a negative step, such as `range(5, 0, -1)`, is now typed `SafeUint` instead of `SafeInt`.
