---
'eslint-rule-forge': minor
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-data-forge': patch
---

`bindValueImportsAt` binds exports for the code at a node. It writes an export through a namespace import of the module (`ns.SafeArray` after `import * as ns`) instead of importing it by name beside the namespace. It prefers a value named import, passes over `import type * as`, and falls back to `bindValueImports` where a local binding shadows the namespace. The `create*` rule factories, ts-std-forge's `prefer-safe-array-length-guard` and ts-data-forge's rules that bind through `tsDataForgeValueAt` or `tsDataForgeValuesAt` now use it. `prefer-obj-over-entries-round-trip` no longer offers a fix when a parameter the rebuilt callback keeps takes the name its `Optional` starts with, which captured it. The factories' messages now name what their fix writes (an alias, or `ns.isNonNullObject`), and, given a file with nothing to report, they no longer work out a binding.
