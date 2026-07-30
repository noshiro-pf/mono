---
'ts-fortress': minor
---

Add `uintRangeInclusive()` and `intRangeInclusive()`, the inclusive-end
counterparts of `uintRange()` and `intRange()`. They accept the same two
argument forms as the exclusive versions — positional
(`uintRangeInclusive(1, 12, { defaultValue: 1 })`) and object
(`uintRangeInclusive({ start: 1, end: 12, defaultValue: 1 })`) — but treat
`end` as part of the range, so `start === end` yields a single-value type.

The corresponding `UintRangeInclusive` / `IntRangeInclusive` types are
re-exported from `ts-type-forge`, and validation failures report a new
`{ kind: 'integer-range-inclusive', start, endInclusive }` error detail.
