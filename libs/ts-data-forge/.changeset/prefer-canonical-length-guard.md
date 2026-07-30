---
'eslint-plugin-ts-data-forge': minor
---

Add the `prefer-canonical-length-guard` rule, which normalizes degenerate `Arr`
length guards to their canonical spelling:

- `Arr.isFixedLengthTuple(xs, 0)`, `Arr.isMaxLengthTuple(xs, 0)` and
  `Arr.isBoundedLengthTuple(xs, 0, 0)` → `Arr.isEmpty(xs)`
- `Arr.isMinLengthArray(xs, 1)` → `Arr.isNonEmpty(xs)`

Every rewrite narrows to exactly the same type, so the autofix is
type-preserving.
