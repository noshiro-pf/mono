---
'ts-data-forge': patch
'eslint-config-typed': patch
---

Build with the native TypeScript compiler instead of Rollup. Each module in `dist/` is now emitted by `tsc` as written, with the type tests, in-source tests and identity casts removed afterwards, so `export` declarations appear inline rather than in a trailing `export { ... }` list. The declarations are unchanged and every module exports the same names as before.
