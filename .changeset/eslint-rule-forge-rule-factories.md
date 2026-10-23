---
'eslint-rule-forge': minor
---

Add rule factories for the rules that several plugins carry, differing only in
the module the fix imports from: `createPreferIsNonNullObject`,
`createPreferIsRecordAndHasKey`, `createPreferArrayIsArray`,
`createPreferSafeParseInt`, `createPreferSafeParseFloat` and
`createNoSideEffectImport`. Also export `isIdentifierNamed` and
`typeHoldsAtEveryLayer`, which they are built from.
