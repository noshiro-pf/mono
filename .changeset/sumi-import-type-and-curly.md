---
'@sumi-lang/oxlint-config': patch
'@sumi-lang/cli': patch
---

Enforce `import type` for type-only imports (D-59), the inline form for
imports mixing values and types, and braces on every statement body (D-61).

The preset now enables `typescript/no-import-type-side-effects` and
`typescript/consistent-type-imports` (`prefer: "type-imports"`,
`fixStyle: "inline-type-imports"`), both reported as
`modules/require-import-type`: under `verbatimModuleSyntax`,
`import { type X } from 'm'` is emitted as `import {} from 'm'`, the side-effect
import the preset already bans. `import/no-duplicates` (`preferInline: true`,
reported as `modules/no-duplicate-import`) keeps one statement per module, so a
mixed import is `import { bar, type Foo }` rather than a separate
`import type`. It also enables `curly: "all"` (`boolean/require-braces`), which
keeps a statement `if` visibly apart from Sumi sugar's `if (c) a else b`
expression.

The ESLint off fragment turns off `curly`,
`@typescript-eslint/no-import-type-side-effects` and `import-x/no-duplicates`.
