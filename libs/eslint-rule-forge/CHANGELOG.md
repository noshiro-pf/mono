# eslint-rule-forge

## 0.3.2

### Patch Changes

- df02523: Update dependencies
- df02523: Declare each rule's default options as `meta.defaultOptions` instead of the top-level `defaultOptions` that `@typescript-eslint/utils` 8.72 deprecates. ESLint 9.15 and later now merge them into `context.options` too, so a rule that is not configured sees its defaults there instead of an empty list; the defaults themselves are unchanged.

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
