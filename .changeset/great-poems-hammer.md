---
'eslint-config-typed': patch
---

Declare `@eslint/core` and `@types/estree` as dependencies. Both are imported
by modules this package publishes while being declared only as
devDependencies. `@eslint/core` is the more serious of the two: the published
`flat-config.d.mts` imports a type from it, so it resolved for consumers only
when their package manager happened to hoist it out of `eslint` — under pnpm it
does not, and type-checking against this config failed.
