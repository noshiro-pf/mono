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

In the plain flavor (`libs/`), the generic `Math.abs` overload takes a
`SmallInt` literal, as in the branded flavor, rather than any `number`. It
returned `AbsoluteValue<N>`, which rewrites only a number literal, so a
ts-type-forge brand came back unchanged: `Math.abs` of an `Int16` was typed
`Int16`, although `Math.abs(-32768)` is `32768`. Any other argument, branded or
not, now gets a `number`; `Math.abs(-3)` is still `3`, while a literal outside
`SmallInt` (`-100`, `-1.5`) is a `number` rather than its absolute value.
