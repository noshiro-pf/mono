---
'ts-fortress': patch
---

`optional` now keeps every property of the type it wraps, including a record
type's `shape`, so nested member types and their constraints stay reachable at
runtime as their types promise, with or without `forceUndefinedDefault`.
`optional` and `required` also keep the wrapped type's prototype, so a `Type`
whose methods are inherited keeps them, and no longer evaluate its lazy
`defaultValue` when called, only when it is read.
