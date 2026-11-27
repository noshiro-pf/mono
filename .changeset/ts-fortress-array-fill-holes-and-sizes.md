---
'ts-fortress': patch
---

`fill` of `array`, `nonEmptyArray` and the length-constrained array types fills
the holes of a sparse array, so its result passes the type's own `is`.
`minLengthArray`, `minLengthTuple`, `maxLengthArray`, `maxLengthTuple`,
`fixedLengthArray`, `boundedLengthArray` and `boundedLengthTuple` throw a
`TypeError` when built with a size that is not a length (`2.5`, `-1`, `NaN`),
which used to throw from some calls of `fill` or `defaultValue` instead.
