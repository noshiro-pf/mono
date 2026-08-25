---
'eslint-plugin-ts-data-forge': minor
---

Add the `prefer-obj-over-entries-round-trip` rule, which replaces an
`Object.fromEntries(Object.entries(record)…)` round trip with the `Obj` function
that expresses it directly: `.map(([k, v]) => [k, value])` becomes `Obj.map`,
`.filter(([k, v]) => …)` becomes `Obj.filter`, and a
`.flatMap(([k, v]) => cond ? [[k, value]] : [])` keep/drop pass becomes
`Obj.filterMap` with `Optional.some` / `Optional.none`. Going through an entries
array loses the evidence that the result still covers the keys of the record it
came from; the `Obj` functions state that invariant in their return type.

The autofix rewrites the callback to the `(value, key)` order `Obj` uses and
drops whichever parameter the new body no longer needs. A round trip that
rebuilds an entry under a _different_ key has no `Obj` counterpart and is left
alone, as are callbacks the rewrite cannot carry over — a block body, an
explicit return type, or one taking the entry index.

The rule is part of the `recommended` config.
