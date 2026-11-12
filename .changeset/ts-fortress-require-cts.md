---
'eslint-plugin-ts-fortress': patch
---

`no-type-only-codec` counts a `require('./a.cjs')` in a TypeScript file (`.ts`, `.cts`, `.mts`) as a use of every export of the module, as it already did in a JavaScript file. TypeScript resolves the argument of `require()` only in a JavaScript file, so the rule had dropped the edge and reported a codec read at run time as type-only.
