---
'eslint-config-typed': minor
---

Write a type-only import as `import type { A }` and an import mixing values and
types as `import { a, type B }`.

`@typescript-eslint/no-import-type-side-effects` is now `error`: under
`verbatimModuleSyntax`, `import { type A } from 'm'` is emitted as
`import {} from 'm'`, a side-effect import. `import-x/no-duplicates` now runs
with `prefer-inline: true`, so a separate `import type` beside a value import
of the same module is merged into the inline form.
`import-x/consistent-type-specifier-style` is turned off, since neither of its
options describes this style.
