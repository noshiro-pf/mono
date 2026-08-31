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

Spell numeric argument ranges with `UintRangeInclusive` instead of `UintRange`: `toFixed(fractionDigits?: UintRangeInclusive<0, 100>)` now names its bounds the way the docs do ("0 – 100, inclusive") rather than with an exclusive upper bound (`UintRange<0, 101>`). Applied to every converted range — `toString` radix, `toPrecision`, JSON `space`, `BigInt.asIntN/asUintN` bits, and the `Intl` digit options. The expanded literal-union types are unchanged; this is purely a notation change in the emitted declarations.
