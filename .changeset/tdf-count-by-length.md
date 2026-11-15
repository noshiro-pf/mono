---
'ts-data-forge': patch
---

The direct form of `Arr.countBy` types each count of a tuple as `0 … N` rather than as an index (`0 … N - 1`), so a count equal to the tuple's length is in its type: `Arr.countBy(['a', 'a', 'a'] as const, (x) => x)` is `IMap<'a', 0 | 1 | 2 | 3>` (was `IMap<'a', 0 | 1 | 2>`). A plain array's count is still `SizeType.Arr`.
