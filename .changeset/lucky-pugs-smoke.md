---
'ts-codemod-lib': patch
'ts-data-forge': patch
'ts-repo-utils': patch
'ts-std-forge': patch
'ts-fortress': patch
'synstate': patch
---

Back every JSDoc `@example` with a type-checked sample file

The `@example` blocks under `src/` are filled from real `.mts` files under
`samples/`, which the package type-checks and — where the package runs its
samples — executes as Vitest cases. Forty-four source files still carried
`@example` blocks written by hand, so what they showed was compiled by
nothing: the snippets are now sample files, and the ones that cannot be
reached from `samples/` — a module-local helper, or a block that is not
TypeScript at all — say what they do in prose instead.

Documentation only; no runtime or type change. A few examples read slightly
differently for it, because an illustration with nothing to assert became one
with an assertion.
