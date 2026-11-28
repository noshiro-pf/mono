---
'eslint-config-typed': patch
'eslint-plugin-ts-restrictions': patch
'ts-data-forge': patch
---

Ship the license notices of code taken from elsewhere, under `third-party/`:
`eslint-config-typed` those of `eslint-plugin-total-functions`,
`eslint-plugin-tree-shakable` and `eslint-plugin-strict-dependencies`, which its
plugins were forked from; `eslint-plugin-ts-restrictions` ESLint's, whose
`no-restricted-syntax` schema its rule copies; and `ts-data-forge` that of
`fast-deep-equal`, which `fastDeepEqual` was forked from. Each is the upstream
license text, copied verbatim.
