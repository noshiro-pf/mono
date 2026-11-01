---
'ts-data-forge': patch
---

Return singleton chunks when `Arr.partition` or `Arr.chunk` is given a chunk
size of `1`, including their curried forms, instead of dropping every element.
