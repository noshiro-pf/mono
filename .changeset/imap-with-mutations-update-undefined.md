---
'ts-data-forge': patch
---

The `'update'` action of `IMap.withMutations` and `IMapMapped.withMutations` now calls its updater for a key whose value is `undefined`, as `update` does. It treated such a key as missing, so the batched form left the value unchanged (and warned "key not found" when that message is on) where `update` replaced it.
