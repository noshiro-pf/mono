---
'eslint-plugin-ts-fortress': minor
---

Add `prefer-namespace-import`, which requires `ts-fortress` to be reached
through a namespace — `import * as t from 'ts-fortress';`, or
`import type * as t from 'ts-fortress';` — rather than through named or default
imports. Its exports are short, generic names (`string`, `record`, `Type`) that
collide with globals and local declarations as soon as they are pulled into a
file's scope.

The autofix rewrites the import and every reference to it: aliases resolve back
to the canonical export, shorthand properties are expanded, and several
`ts-fortress` imports in one file collapse into a single namespace import,
merging into the one the file already has when there is one. It is withheld —
the violation is still reported — when the namespace name is bound to something
else at the import or at a reference, when a binding is re-exported by name,
when a value import would have to merge into a type-only namespace, or when a
declaration mixes a namespace specifier with a named one.

The name the fix introduces defaults to `t` and is configurable with the
`namespaceName` option. Being part of the `recommended` preset, the rule is on
for anyone using it.
