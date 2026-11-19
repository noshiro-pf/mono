---
'eslint-plugin-ts-data-forge': patch
---

`prefer-canonical-array-slicing` no longer fixes a rewrite that would not
compile or would drop a comment. A literal count above 39 (`xs.slice(0, 100)` →
`Arr.take(xs, 100)`), which `Arr.skip`, `Arr.take`, `Arr.skipLast` and
`Arr.takeLast` do not take without `asUint32`, is reported without a fix; a call
holding a comment the rewrite has no place for (`xs.slice(/* header */ 2)`) is
reported with a suggestion instead. An array literal under a const assertion
(`[...xs, 1] as const`) is left alone: `as const` on the call does not compile.
