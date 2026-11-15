---
'ts-data-forge': minor
---

`Str`, `Json`, `Obj`, `IMap`, `ISet`, `IMapMapped`, `ISetMapped` and
`TsDataForgeInternals.RefinedNumberUtils` are now frozen module namespace
objects rather than plain objects, so a consumer that adds to or stubs one of
their members can no longer do so. Every public name, member and qualified type
path (`Json.Reviver`, `IMap<K, V>`,
`TsDataForgeInternals.RefinedNumberUtils.NumberClass`) stays as it was; the
internal `TsDataForgeInternals.RefinedNumberUtils` also names the helper types
its factories return (`UnknownNumberBrand`, `OperatorsForInteger`, …), which
were unexported before.

They were TypeScript value namespaces, which compile to an immediately invoked
function that a bundler keeps whole and that Node.js's type stripping refuses.
Written as `export * as` modules, as `Arr` and `Num` already are, a bundle can
drop the members it does not use, and the sources contain only erasable syntax.
