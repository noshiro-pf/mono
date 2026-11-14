---
'ts-type-forge': patch
---

`RecordValueAtPath`, `RecordValueAtPathWithIndex` and `RecordPathAndValueTypeTuple` gave `never` for a path through an optional or nullable property, although `RecordPaths` lists such paths: `RecordValueAtPath<{ a?: { c: 1 } }, ['a', 'c']>` was `never`, which is assignable to anything. It is now `1 | undefined`. A union parent is read one member at a time: a member that is nullish, or that does not have the rest of the path, adds `undefined`, so `RecordValueAtPath<{ u: { k: 1 } | { k: 2; z: 3 } }, ['u', 'z']>` is `3 | undefined`.
