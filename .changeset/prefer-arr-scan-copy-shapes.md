---
'eslint-plugin-ts-data-forge': patch
---

`prefer-arr-scan` now reports a `reduce` that copies its accumulator in the shapes it missed: a spread of the accumulator at a later position (`[x, ...acc]`, `[...head, ...acc, x]`), a body wrapped in `as` or `satisfies`, and a block body or function expression whose single statement returns the copy. Those are reported without a fix; the fix stays with the `[...acc, x]` and `Arr.toPushed(acc, x)` expression bodies `scan` can express.
