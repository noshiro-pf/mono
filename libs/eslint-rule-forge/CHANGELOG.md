# eslint-rule-forge

## 0.5.0

### Minor Changes

- ae82fef: `bindValueImports` adds a name inside the empty braces of `import {} from 'm'` or `import D, {} from 'm'`, where it wrote a duplicate declaration or `import D, { x }, {} from 'm'`, a syntax error; the autofixes of the rules this package builds (`prefer-array-is-array`, `prefer-safe-parse`, `prefer-is-non-null-object`, `prefer-is-record-and-has-key`) go through it. New exports: `addTypeImports`, which imports types into an existing `import type { … }` or, as `type X`, into another import from the module, and `addToImportBraces`, the placement both share.
- 7001f62: Add `siblingOf(node, offset)`: the statement next to (`1`) or before (`-1`) a node in the statement list it is one of, a declaration under `export` read as the `export` statement.

### Patch Changes

- 5a9d62a: `prefer-num-safe-parse-int` and `prefer-num-safe-parse-float` (eslint-plugin-ts-data-forge), `prefer-safe-number-parse-integer` and `prefer-safe-number-parse` (eslint-plugin-ts-std-forge), and the `createPreferSafeParseInt` / `createPreferSafeParseFloat` factories they are built from (eslint-rule-forge) now offer their rewrite as a suggestion instead of applying it with `--fix`. The replacement parses some strings differently from the original: `parseInt('1e3')` is 1 and the rewrite 1000, `parseFloat('12px')` is 12 and the rewrite NaN, and `Number('')` is 0 and the rewrite NaN. The report is unchanged, and its message now says so. A lint run that relied on `--fix` to clear these reports now leaves them: apply the suggestion where the input allows it, or keep the original call with a disable comment that says why.

## 0.4.0

### Minor Changes

- 2d09754: `eslint-rule-forge` gains `bindValueImports`, which gives the local names to write for a module's exports and the edits that bind them as values, and exports `hasCommentWithin` and `importedNameOf`. `bindValueImports` adds a name to an existing named import from the module, drops `type` from an inline type specifier, refuses when an import already binds the name to something else, and treats a missing `importKind` (ESLint's default parser) as a value import. A lone default import takes the name in braces (`import D, { x }`). `buildNamedImportFix` now inserts after the directive prologue and any comment on its last line, so `'use client';` stays a directive and an `eslint-disable-line` there keeps its line.

    The rules built by `createPreferArrayIsArray`, `createPreferIsNonNullObject`, `createPreferIsRecordAndHasKey`, `createPreferSafeParseInt` and `createPreferSafeParseFloat` (in `eslint-plugin-ts-data-forge` and `eslint-plugin-ts-std-forge`: `prefer-arr-is-array`, `prefer-safe-array-is-array`, `prefer-is-non-null-object`, `prefer-is-record-and-has-key`, `prefer-num-safe-parse-int`, `prefer-num-safe-parse-float`, `prefer-safe-number-parse`, `prefer-safe-number-parse-integer`) use it:

    - The name is added to the file's existing named import instead of a new declaration at the top, so the fixed file passes `import-x/no-duplicates` and a leading directive stays first.
    - A name imported only as a type (`import { type Arr }`) has its `type` dropped instead of being written as a value nothing imports; one imported by `import type { Arr }` gets no fix.
    - An aliased import is written by its local name.
    - No fix is offered where something other than the import is bound to the name.
    - Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.

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
