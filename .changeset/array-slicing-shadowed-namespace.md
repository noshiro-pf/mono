---
'eslint-plugin-ts-data-forge': patch
---

`prefer-canonical-array-slicing` now fixes a call where a local binding shadows the `ts-data-forge` namespace import by importing `Arr` by name. It sees `Arr.skip(xs, 1)` and `ns.Arr.skip(xs, 1)` through type wrappers. It no longer reports them when a local binding shadows the imported `Arr` or namespace there, or when the namespace comes from `import type`.
