---
'ts-fortress': patch
---

`t.minLengthTuple(n, elementType).fill(value)` keeps every element of an array that already has `n` or more, each passed through the element type's `fill`, instead of cutting the array down to exactly `n` (`fill([1, 2, 3])` for a minimum of 2 is `[1, 2, 3]`, not `[1, 2]`). A shorter array is still padded up to `n`, as `t.minLengthArray` does. Code that relied on `fill` to cut a longer array down to `n` elements has to cut it itself.
