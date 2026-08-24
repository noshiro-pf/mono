---
'ts-repo-utils': patch
---

Give ESLint the same standard library the type check uses.

Linting and type checking run different TypeScript versions — typescript-eslint
imports the `typescript` module (6.x), while the type check runs
`typescript-native` (7.x) — and the two resolve a lib replacement by opposite
routes. TypeScript 7 reads `paths`; TypeScript 6 ignores it there and looks
`@typescript/lib-*` up by name. So the `paths` entry that opts a package into
the strict library did nothing for lint, which quietly kept TypeScript's own
declarations and enforced less than the type check did.

`strict-ts-lib-v6.0` is now a root devDependency, and its linker runs from the
root `prepare` script to supply those names.
