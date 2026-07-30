---
'ts-fortress': patch
---

`IntRange<Start, End>` is now re-exported from `ts-type-forge` instead of being
declared locally, mirroring how `UintRange` is already handled. The exported
type name and its semantics are unchanged.

Requires `ts-type-forge` 8.0.0, the release that adds `IntRange`. That release
also constrains the bounds of the whole integer-range family (`Uint11`, `0` to
`2047`, for `UintRange` / `UintRangeInclusive`; `Int11`, `-1024` to `1023`, for
`IntRange` / `IntRangeInclusive`).
