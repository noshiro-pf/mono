---
'eslint-config-typed': minor
---

New rule `ts-restrictions/no-export-type-side-effects`, on in the preset: a re-export whose specifiers are all inline `type` (`export { type A } from 'm'`) is emitted under `verbatimModuleSyntax` as `export {} from 'm'`, a runtime load of `m`, and is fixed to `export type { A } from 'm'`. It is the re-export twin of `@typescript-eslint/no-import-type-side-effects`.
