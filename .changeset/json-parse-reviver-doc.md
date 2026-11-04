---
'ts-data-forge': patch
---

`Json.parse`'s documentation now says that with a reviver the result is whatever the reviver returned for the root, such as a `Date` or `undefined`, and is not checked to be JSON although it is typed `JsonValue`, so it is to be widened to `unknown` before it is narrowed. It also says that the reviver's `value` for an outer object holds what it already returned for the children, and that returning `undefined` for a child deletes that property from an object and leaves a hole in an array. The example widens and narrows the revived value instead of only checking `Result.isOk`. The types are unchanged.
