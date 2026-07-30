---
'ts-fortress': minor
---

`uintRange()` and `intRange()` now accept their bounds as positional arguments -
`uintRange(1, 13, { defaultValue: 1 })` - in addition to the existing options
object form `uintRange({ start: 1, end: 13, defaultValue: 1 })`. The object form
keeps working unchanged, so this is backward compatible.

The bounds these functions accept are also widened from `Int8` / `Uint8` to
`Int11` / `Uint11`, the caps the whole integer-range family now uses:
`intRange()` covers `-1024` to `1024` and `uintRange()` covers `0` to `2048`
(the `end` bound is exclusive, hence one past the `Int11` / `Uint11` maximum).
