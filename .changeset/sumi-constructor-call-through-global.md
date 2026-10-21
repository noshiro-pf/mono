---
'@sumi-lang/oxlint-config': patch
---

`banned-syntax/no-constructor-call` and `banned-syntax/no-new-array` now see a constructor reached through the global object (`globalThis.Number(x)`, `globalThis['String'](x)`, `new globalThis.Array(3)`, and `window`, `self` and `global` alike) unless a user declaration shadows that name. `no-constructor-call` also reports a constructor used as a template tag (`` String`42` ``), and `no-new-array` now leaves alone a locally declared `Array`, as `no-constructor-call` already did.
