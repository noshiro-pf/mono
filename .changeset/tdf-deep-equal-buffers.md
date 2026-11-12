---
'ts-data-forge': patch
---

`fastDeepEqual` compares an `ArrayBuffer`, a `SharedArrayBuffer` and a `DataView` by their bytes. Having no enumerable keys, any two of them were equal, whatever their length or contents, and `replaceEqualDeep` kept an old buffer when one with other bytes arrived.
