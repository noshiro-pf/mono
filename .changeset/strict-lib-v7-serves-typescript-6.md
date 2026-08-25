---
'strict-ts-lib-v7.0': minor
---

Declare `typescript >=6.0.0 <8.0.0` instead of `>=7.0.0 <7.1.0`.

TypeScript 6.0.3 compiles this lib set with `skipLibCheck: false` and no
errors, and resolves `@typescript/lib-*` by the same package-name lookup
TypeScript 7 uses, so one package serves both compilers. Measured on a project
holding both: 88 lib files from this package and none from either compiler's
own, through the bundled linker alone with no `paths` entry.

That matters for a project whose type check and lint run different TypeScript
versions — typescript-eslint loads the `typescript` module, which may be a
major behind the compiler doing the type check. Such a project can now install
one bundle and run `npx strict-ts-lib-v7.0-link` once, instead of pairing a
`paths` route for one compiler with a name route for the other.

The `paths` route is unchanged and still supported.
