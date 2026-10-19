---
'eslint-plugin-ts-data-forge': patch
---

`prefer-canonical-array-slicing` now reads through type wrappers (`as`, `satisfies`, `!`, `<T>`) in the places it still did not: a `filter` callback whose body is wrapped (`(_, i) => (i >= 1) satisfies boolean`), a wrapped `xs.length - N` or a wrapped `.length` inside it (`(xs as readonly T[]).length - 1`), and a wrapped receiver compared with its own `.length`. These were not reported before. `prefer-arr-is-bounded-length-array` now also takes a `min && max` pair whose comparisons are wrapped as a whole (`(xs.length >= 1 satisfies boolean) && xs.length <= 3`), and `prefer-arr-is-min-length-array` / `prefer-arr-is-max-length-array` leave such a pair to it instead of rewriting each half.
