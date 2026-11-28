---
'ts-data-forge': patch
---

`Obj.fromEntries` types its result as the strict `Object.fromEntries` does: a
later entry replaces an earlier one with the same key rather than giving
`never`, a union-keyed entry makes its keys optional rather than required, a key
with no literal gives an index signature and widens the keys it may overwrite, a
number key sets its string, a branded literal key widens to an index signature,
and entries that are not a tuple make each literal key optional.
