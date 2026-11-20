---
'eslint-plugin-ts-restrictions': patch
---

`prefer-non-mutating-array-method` fixes `Array.from(xs).fill(v)` to
`Array.from(xs, () => v)` rather than `xs.map(() => v)`, which kept the holes of
a sparse array that `fill` writes: `Array.from(Array(3)).fill(0)` is
`[0, 0, 0]`, and `Array(3).map(() => 0)` three holes.
