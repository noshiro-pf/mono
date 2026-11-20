---
'eslint-config-typed': patch
'eslint-plugin-ts-restrictions': patch
---

`prefer-non-mutating-array-method` suggests, rather than fixes, a rewrite whose
method has an argument that may have an effect (`Array.from(xs).sort(cmp())`):
`Array.from(xs)` copies `xs` before the argument runs, and `xs.toSorted(…)`
reads it after, so an argument that changes `xs` changes what is sorted.
