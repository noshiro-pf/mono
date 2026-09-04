---
'better-preact-use-state': patch
'better-react-use-state': patch
'eslint-config-typed': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-type-forge': patch
'github-settings-as-code': patch
'octokit-safe-types': patch
'synstate': patch
'synstate-preact-hooks': patch
'synstate-preact-signals': patch
'synstate-react-hooks': patch
'synstate-react-hooks-compat': patch
'ts-codemod-cli': patch
'ts-codemod-lib': patch
'ts-data-forge': patch
'ts-fortress': patch
'ts-repo-utils': patch
'ts-std-forge': patch
---

Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

`github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.
