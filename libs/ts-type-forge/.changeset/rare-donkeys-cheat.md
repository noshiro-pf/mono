---
'eslint-plugin-ts-type-forge': patch
---

`prefer-canonical-length-constrained-tuple` no longer rewrites tuples that
appear in the `extends` clause of a conditional type. There a tuple is a match
pattern: `[A, B] extends [true, true]` matches element-wise while `A` and `B`
are still generic, whereas the canonical spellings resolve through a mapped
type and make the checker defer the whole conditional, silently widening the
result.
