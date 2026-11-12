---
'eslint-plugin-ts-data-forge': minor
---

`prefer-canonical-length-guard` builds its emptiness checks with `eslint-rule-forge`'s `createPreferEmptinessGuard`, the factory `eslint-plugin-ts-std-forge` uses too. `xs.length !== 0` now becomes `Arr.isNonEmpty(xs)` rather than `!Arr.isEmpty(xs)`, `xs.length < 1` is reported as `Arr.isEmpty(xs)`, and `xs.length === 0`, `<= 0` and `>= 1` reach `Arr.isEmpty` / `Arr.isNonEmpty` in one fix instead of two.
