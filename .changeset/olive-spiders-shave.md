---
'ts-data-forge': patch
---

`IMapMapped` and `ISetMapped` now build their "key not found" warning with `unknownToString`, as `IMap` and `ISet` already did.

The mapped variants were the only four of the eight call sites still using `String(...)`, which cannot accept the `null` and `undefined` that `MapSetKeyType` admits. The message is a `console.warn` diagnostic emitted only when the collection was created with the not-found warning enabled; the one visible difference is that a `bigint` key now prints as `1n` rather than `1`.
