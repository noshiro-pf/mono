---
'eslint-config-typed': patch
---

`ts-restrictions/prefer-optional-chain-over-ternary` no longer reports, or fixes, a ternary whose access goes through a parenthesized `as`, `satisfies` or optional chain between its links, such as `x == null ? undefined : (x.b as T).c`. The fix spliced `?.` in after `x`, giving `(x?.b as T).c`, and the parentheses end the optional chain, so for a nullish `x` the fixed code read `.c` of `undefined` and threw where the ternary gave `undefined`. A wrapper around the whole access, and a `!` anywhere, are still looked through.
