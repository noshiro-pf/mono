---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

In the branded flavor (`libs-branded/`), `Math.floor`, `Math.ceil`, `Math.round`
and `Math.abs` of a finite branded number no longer keep brands the operation
does not preserve:

- `floor` / `ceil` / `round` return an integer argument's type unchanged,
  including a generic caller's type parameter. For any other argument they keep
  only the sign bound (`NonNegativeInt` / `NonPositiveInt`), and non-zero only
  where rounding moves away from zero: `Math.ceil` of a positive number is a
  `PositiveInt`, `Math.floor` of a negative number a `NegativeInt`. `Math.floor`
  of a `PositiveFiniteNumber` had been typed non-zero, though `Math.floor(0.5)`
  is `0`.
- `abs` returns a non-negative argument's type unchanged, so a `Uint16` stays a
  `Uint16`. For any other argument it keeps finiteness and integrality, turns a
  signed width into the unsigned one (`Int16` to `Uint16`, `Int32` to `Uint32`),
  keeps `SafeInt`, and is positive exactly when the argument is non-zero. An
  `Int16` had stayed an `Int16`, though `Math.abs(-32768)` is `32768`, and a
  `NegativeFiniteNumber` had kept its `<= 0` bound.

Code that relied on a dropped brand stops compiling — for example
`const d: NonZeroNumber = Math.floor(positive)` or passing `Math.abs(int16)`
where an `Int16` is expected — because the value it accepted could break that
brand. A `Float16` / `Float32` / `Float64` brand on a non-integer argument is
dropped too, though the operation would keep it. The plain flavor is unchanged.
