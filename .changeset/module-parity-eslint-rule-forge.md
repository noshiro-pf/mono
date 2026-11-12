---
'eslint-rule-forge': minor
---

`bindValueImports`, `bindValueImportsAt`, `createPreferIsNonNullObject`, `createPreferIsRecordAndHasKey`, `createPreferSafeParseInt` and `createPreferSafeParseFloat` take `equivalentModules` (the new `EquivalentModule` type): modules that export some of the module's exports as the same declarations. An import of one of those names from such a module is reused by the fix, and a name still to add joins that import when the file imports nothing from the module itself, where the fix used to be refused.
