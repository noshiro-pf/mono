---
'ts-data-forge': major
---

Rename the branded-number namespaces' `clamp` operator to `fromNumber`.

Every branded number type (`Int16`, `Uint8`, `PositiveFiniteNumber`, …) exposed a
one-argument `clamp(x: number)` that coerces an arbitrary `number` into the type's
domain by saturating it into `[MIN_VALUE, MAX_VALUE]` (and rounding to the nearest
integer, for integer types). This is a total domain projection — the counterpart of
the `is*` guard and the throwing `as*` cast — not the usual three-argument
`clamp(value, lo, hi)`, and the name collided with `Num.clamp` (the curried range
clamp) and the array slice-clamp helpers. It is now named `fromNumber`, which
matches what it does and reads correctly even for open-domain types such as
`PositiveFiniteNumber`, where there is no natural `[lo, hi]` range.

`Num.clamp` and the array slice-clamped utilities are unchanged.

The `MIN_VALUE` / `MAX_VALUE` constants are unchanged; their JSDoc now clarifies that
for open-domain types they are the nearest _representable_ in-domain value (the
saturation target of `fromNumber`), not the mathematical bound.

BREAKING CHANGE: replace `<Type>.clamp(x)` with `<Type>.fromNumber(x)` for every
branded number type — e.g. `Int16.clamp(100_000)` becomes
`Int16.fromNumber(100_000)`. `Num.clamp` is not affected.
