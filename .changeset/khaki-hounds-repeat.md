---
'eslint-plugin-ts-type-forge': patch
---

`prefer-canonical-length-constrained-tuple` no longer rewrites a tuple that
spells out a recursive type alias. A tuple literal is what lets TypeScript
resolve `type T = readonly [T, T]`; routing the same cycle through
`FixedLengthTuple` makes the alias an error type, and every use of it then
reads as `any`. Cycles closed through another alias in the same file are
detected too, and those are the common case.
