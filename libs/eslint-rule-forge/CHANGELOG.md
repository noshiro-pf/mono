# eslint-rule-forge

## 0.3.1

### Patch Changes

- ca74a91: Update dependencies

## 0.3.0

### Minor Changes

- 384b952: Add rule factories for the rules that several plugins carry, differing only in
  the module the fix imports from: `createPreferIsNonNullObject`,
  `createPreferIsRecordAndHasKey`, `createPreferArrayIsArray`,
  `createPreferSafeParseInt`, `createPreferSafeParseFloat` and
  `createNoSideEffectImport`. Also export `isIdentifierNamed` and
  `typeHoldsAtEveryLayer`, which they are built from.

## 0.2.0

### Minor Changes

- fba7527: Add the helpers for writing the negation of a condition, which `eslint-config-typed` and `eslint-plugin-ts-data-forge` now share: `negationOf` (an inverted comparison, De Morgan for `&&` and `||`, `a` for `!a` when `a` is a boolean, otherwise `!a`), `prefixedNegationOf`, `isComparison`, `isExactlyInvertible` (which declines a relational comparison whose operands may be `NaN`), `invertedComparisonText`, `needsParenthesesAsOperandOf` and `createGetLayerTypes`.
