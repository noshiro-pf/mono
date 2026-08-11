---
'eslint-config-typed': patch
---

Drop the unused `@types/eslint` and `typescript-eslint` dependencies. ESLint 10
ships its own type definitions, and the `typescript-eslint` meta-package was
never imported — this config depends on `@typescript-eslint/parser`,
`@typescript-eslint/utils` and the individual plugins directly.
