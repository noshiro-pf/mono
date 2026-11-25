---
'eslint-plugin-ts-data-forge': patch
---

`prefer-arr-sum` now reports the reducer that sums a property,
`xs.reduce((acc, x) => acc + x.v, 0)` (or `x.v + acc`), and fixes it to
`Arr.sumBy(xs, x => x.v)`, keeping a nested path, a bracket key and the type
wrappers of the property's side. It no longer reports
`xs.reduce((a, b) => a.v + b.v, 0)`, which reads a property of the running total
and does not compile, and whose fix changed the result. The `Arr.sumBy` half now
also requires the receiver to be an array or a tuple.
