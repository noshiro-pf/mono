---
'ts-data-forge': minor
---

Add `replaceEqualDeep(current, next, options?)`. It returns `next` with every part deeply equal to the same part of `current` replaced by that part (structural sharing), and `current` itself when the whole of `next` is deeply equal to it, so a reader that compares by reference sees a new object only where the value changed. Plain objects and arrays are walked into; a `Map`, a `Set`, a `Date` or a class instance is compared with `fastDeepEqual` and kept or replaced whole. Array items are matched by index, or by `options.key` for the items it returns a key for.
