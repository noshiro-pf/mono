---
'ts-repo-utils': patch
---

`genIndex` now picks each export's extension from the source file's own
extension rather than applying `exportStatementExtension` to everything.

TypeScript resolves a specifier by the name the file emits, so a directory
holding both `.mts` and `.tsx` needs two different extensions — `.mjs` and
`.js`. One configured value cannot express that, and the result did not
resolve: a directory generated with `--target-ext .tsx --export-ext .mjs`
produced `export * from './component-switcher.mjs'` for a `.tsx` file.

`exportStatementExtension` stays the fallback, for extensions with no known
emit, and `'none'` still means extensionless.
