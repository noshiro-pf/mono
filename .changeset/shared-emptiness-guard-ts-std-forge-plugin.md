---
'eslint-plugin-ts-std-forge': minor
---

Add `no-side-effect-import` (in the recommended config), which removes `import 'ts-std-forge';`. `prefer-safe-array-length-guard` now also reports `xs.length <= 0` and `xs.length < 1` as `SafeArray.isEmpty(xs)`; it is built by `eslint-rule-forge`'s `createPreferEmptinessGuard`, as `eslint-plugin-ts-data-forge`'s `prefer-canonical-length-guard` is.
