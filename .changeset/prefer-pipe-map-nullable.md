---
'eslint-plugin-ts-data-forge': minor
---

Add `prefer-pipe-map-nullable`, which rewrites `pipe(x).map(mapNullable(fn))` to `pipe(x).mapNullable(fn)`. The fix is applied automatically unless an inline function's inferred result type has a literal or tuple part, which `mapNullable` keeps and `Pipe.mapNullable` widens; it is then offered as a suggestion. The rule is enabled in the `recommended` config.
