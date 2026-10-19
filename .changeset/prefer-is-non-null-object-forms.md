---
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-non-null-object` now reports the other ways of writing `typeof u === 'object' && u !== null`: the two halves in reverse order, either comparison with its operands swapped (`'object' === typeof u`, `null !== u`), `u != null` (which `typeof u === 'object'` has already made the same check), and the pair anywhere in a longer `&&` chain (`typeof u === 'object' && u !== null && 'k' in u` becomes `isNonNullObject(u) && 'k' in u`). The two halves have to be next to each other in the chain. The `eslint-plugin-ts-data-forge` version now also reads the two halves through type wrappers around each of them, as the `eslint-plugin-ts-std-forge` version already did.
