---
'eslint-plugin-ts-restrictions': patch
---

`prefer-non-mutating-array-method` no longer rewrites `Array.from(xs).splice(…)`
to `xs.toSpliced(…)`: `splice` returns the elements it removed and `toSpliced`
the array without them, so `--fix` replaced one list with the other. It rewrites
to `slice` instead where that returns the same elements:
`Array.from(xs).splice(s)` becomes `xs.slice(s)`, and
`Array.from(xs).splice(s, c)` with non-negative integer literals becomes
`xs.slice(s, s + c)`. Any other `splice` on a copy (inserted items, a negative
start with a count, a count that is not a literal) is left alone; `reverse`,
`sort` and `fill` are rewritten as before.
