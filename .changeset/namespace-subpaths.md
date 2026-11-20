---
'eslint-rule-forge': minor
'eslint-plugin-ts-data-forge': minor
---

`bindValueImports` and `bindValueImportsAt` (and the factories that call them:
`createPreferEmptinessGuard`, `createPreferArrayIsArray`,
`createPreferIsNonNullObject`, `createPreferIsRecordAndHasKey` and the
safe-parse rules) take `namespaceSubpaths`: exports of the module that are also
the namespace of a module of their own. eslint-plugin-ts-data-forge passes `Arr`
as `ts-data-forge/array` and `Num` as `ts-data-forge/number`, so that
`import * as Arr from 'ts-data-forge/array'` binds what
`import { Arr } from 'ts-data-forge'` does in every rule, and a fix in a file
that imports a subpath adds `Arr` or `Num` as a namespace import of it.
