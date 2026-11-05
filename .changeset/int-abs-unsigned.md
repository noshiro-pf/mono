---
'ts-data-forge': patch
---

`Int16.abs` and `NonZeroInt16.abs` now return `Uint16` and `PositiveUint16`, and `Int32.abs` and `NonZeroInt32.abs` return `Uint32` and `PositiveUint32`. They returned the input's own signed type, which `abs(MIN_VALUE)` (`2^15` / `2^31`) does not satisfy. Code that passes the result back where an `Int16` / `Int32` is expected no longer type-checks; convert it with `fromNumber` of the type it came from (`Int16.fromNumber`, `NonZeroInt16.fromNumber`, ..., which saturates `abs(MIN_VALUE)` to `MAX_VALUE`), or widen to `Int32` / `SafeInt`.
