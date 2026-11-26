---
'ts-type-forge': patch
---

`RecordValueAtPathWithIndex` and `RecordValueAtPath` add `undefined` for every step of a path that may read nothing, not only for a last element of the type `number` or `string`: an index into an array that is not a fixed-length tuple (`['a', number, 'x']`, or a literal index such as `['a', 'b', 0]` into a `string[]`), `number` into a tuple, and a key an index signature admits, a template-literal pattern key included. A union member with an index signature or an array no longer counts as holding every key it admits: `RecordValueAtPath<{ u: Record<string, 1> | { z: 3 } }, ['u', 'z']>` is `1 | 3 | undefined`. A fixed-length tuple's literal index still reads without `undefined`.

`RecordUpdated` keeps a member of a union parent the path does not reach unchanged, where it dropped it: `RecordUpdated<{ u: { k: 1 } | { k: 2; z: 3 } }, ['u', 'z'], 9>['u']` is `{ readonly k: 1 } | { readonly k: 2; readonly z: 9 }`.
