---
'ts-data-forge': patch
---

`IMap`, `ISet`, `IMapMapped` and `ISetMapped` write with the key `-0` as they read with it. `has(-0)` and `get(-0)` already found the entry under `0`, but `delete(-0)`, `set(-0, v)` and `update(-0, f)` returned the collection unchanged. They now go through `withMutations`, which compares keys as the native `Map` and `Set` do.
