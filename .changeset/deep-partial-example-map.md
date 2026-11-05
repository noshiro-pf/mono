---
'ts-type-forge': patch
---

Correct the `DeepPartial` example: a `Map` property stays a mutable `Map` whose keys and values are made deeply partial (a primitive stays as it is), not `ReadonlyMap<K | undefined, V | undefined>`. The sample now asserts the result with `expectType`.
