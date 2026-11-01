---
'eslint-plugin-ts-data-forge': patch
---

`prefer-arr-uniq` now reports `Array.from(new Set(xs))` and `[...new Set(xs)]` over arrays of branded primitives, such as `readonly Int[]` or `readonly (string & Readonly<{ brand: 'Id' }>)[]`. It accepted an element type only when its own flags were primitive, and a branded primitive is an intersection, so these were skipped although `Arr.uniq` accepts them.
