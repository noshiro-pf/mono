---
'ts-data-forge': minor
---

Add `Obj.map`, which transforms every value of a record while keeping its key
set. Unlike `Object.fromEntries(Object.entries(record).map(...))`, the result is
a mapped type over `keyof R`, so keys, their optional modifiers and index
signatures survive instead of collapsing into `Partial<...>`.
