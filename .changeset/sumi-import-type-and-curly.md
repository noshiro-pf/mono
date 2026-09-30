---
'@sumi-lang/oxlint-config': patch
'@sumi-lang/cli': patch
---

Enforce `import type` for type-only imports (D-59) and braces on every
statement body (D-61).

The preset now enables `typescript/no-import-type-side-effects` and
`typescript/consistent-type-imports` (`prefer: "type-imports"`), both reported
as `modules/require-import-type`: under `verbatimModuleSyntax`,
`import { type X } from 'm'` is emitted as `import {} from 'm'`, the side-effect
import the preset already bans. It also enables `curly: "all"`
(`boolean/require-braces`), which keeps a statement `if` visibly apart from
Sumi sugar's `if (c) a else b` expression.

The ESLint off fragment turns off `curly`,
`@typescript-eslint/no-import-type-side-effects` and
`import-x/consistent-type-specifier-style`; the last asks for the inline form
the preset now rejects.
