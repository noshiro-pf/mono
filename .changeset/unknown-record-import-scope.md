---
'ts-codemod-lib': patch
---

`replace-record-with-unknown-record` no longer imports `UnknownRecord` where the file cannot take it: a script (a `global.d.ts`, which an import would turn into a module) is left alone, and so is a file whose top level binds `UnknownRecord` to a value or a namespace; where `UnknownRecord` is already in scope it is written with no new import. It decides with the same check `convert-to-readonly` uses for `ReadonlyRecord`, now shared as `typeNameScope` and `typeNameUse`.
