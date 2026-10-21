---
'@sumi-lang/checker': patch
---

`mutation/no-mutation-without-mut-prefix` now reports the member accesses a destructuring assignment writes to (`[a.x, b.y] = pair`, `({ k: o.v } = obj)`, nested patterns and rest elements included), and the same in a `for … of` / `for … in` header. Before, it reported only an assignment whose left side was itself an access.
