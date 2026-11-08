# eslint-rule-forge

## 0.9.0

### Minor Changes

- b0c7efb: New `asNode(node)`: a `DeepReadonly` node typed as the mutable node it is, for an ESLint or typescript-eslint API that declares a mutable parameter and only reads it, so that a rule does not carry a cast of its own.
- 00010f5: New `mayHaveEffect(node, sourceCode)`: `ASTUtils.hasSideEffect` plus what it leaves out — a tagged template, which calls its tag, and a spread into an array or arguments, which runs an iterator — without looking into a function's body, for a fix that moves or drops an expression.
- 72f799b: `buildCalleeResolver` resolves a default import (`import d from 'm'`, `d(…)`) to the export `default`, and the `ResolvedCallee` it returns carries `bindingNode`, the identifier whose binding decides what is called: the callee, or the namespace object. `ResolvedCallee` gains that field as a required one, so code that builds one itself has to supply it. The new `isShadowedCallee(sourceCode, resolved, moduleNames)` says whether that identifier is bound to something other than an import from `moduleNames` where the call is made, and `hasForeignBinding` takes several module names too.

## 0.8.0

### Minor Changes

- 9c5c814: `prefer-is-non-null-object` (eslint-plugin-ts-data-forge and eslint-plugin-ts-std-forge) and the `createPreferIsNonNullObject` factory it is built from (eslint-rule-forge) no longer report, or rewrite, `typeof u === 'object' && u !== null` when `u` is a global or a `declare`d name. `typeof window === 'object' && window !== null` returns `false` where `window` does not exist, while `isNonNullObject(window)` throws a `ReferenceError`. The other order, `u !== null && typeof u === 'object'`, already reads `u` and is fixed as before, as is either order on a name the file creates at runtime — a variable, a parameter, a value import.

    eslint-rule-forge also exports `isRuntimeBound(sourceCode, node, name)`, which tells whether a name read at a node is a value the file creates at runtime rather than a global, a `declare`d name, a type-only import or a `const enum`.

### Patch Changes

- 95c464f: `prefer-is-record-and-has-key` no longer auto-fixes `key in obj` unless `obj` is typed as a plain record: `Record<string, …>`, or an object type literal or object literal with a string index signature, none of whose properties a class or an interface declares. On a class, an interface, a type parameter, a mapped type over a class (`Readonly<Bag>`) or anything else, always without type information, and for a literal key naming a member of `Object.prototype` (`'constructor' in rec`), it reports `inReadsPrototypeChain` and offers the rewrite as a suggestion. `hasKey` checks own properties where `in` walks the prototype chain, and `isRecord` rejects functions, so the fix turned `'then' in promise`, `'size' in map`, a class method check and `'name' in fn` from `true` to `false`. The fix on a plain record still turns a key read at run time that names an `Object.prototype` member from `true` to `false`.
- b2ce1b1: `prefer-is-record-and-has-key` fixes `Object.hasOwn(obj, key)` into `isRecord(obj) && hasKey(obj, key)` only when type information shows that `obj` cannot be a function at any layer of type wrappers: no call or construct signature, and not `object`, `unknown`, `any`, `Function` or a type parameter constrained by one of them. `isRecord` rejects every function, which `Object.hasOwn` accepts (`Object.hasOwn(fn, 'name')`, a class's static members), so the fix turned those from `true` to `false`. Elsewhere, and without type information, the rewrite is a suggestion that says so.

## 0.7.0

### Minor Changes

- 23fad6b: New `inlineTypeQualifierRange(sourceCode, specifier)`: the range a fix removes to drop the inline `type` of an import or export specifier, up to whatever follows it so that a comment there stays. `bindValueImports` uses it for the edit that turns `import { type x }` into a value import.

### Patch Changes

- Updated dependencies [23bfcbe]
    - ts-type-forge@9.2.3

## 0.6.0

### Minor Changes

- 292016d: `bindValueImportsAt` binds exports for the code at a node. It writes an export through a namespace import of the module (`ns.SafeArray` after `import * as ns`) instead of importing it by name beside the namespace. It prefers a value named import, passes over `import type * as`, and falls back to `bindValueImports` where a local binding shadows the namespace. The `create*` rule factories, ts-std-forge's `prefer-safe-array-length-guard` and ts-data-forge's rules that bind through `tsDataForgeValueAt` or `tsDataForgeValuesAt` now use it. `prefer-obj-over-entries-round-trip` no longer offers a fix when a parameter the rebuilt callback keeps takes the name its `Optional` starts with, which captured it. The factories' messages now name what their fix writes (an alias, or `ns.isNonNullObject`), and, given a file with nothing to report, they no longer work out a binding.

## 0.5.1

### Patch Changes

- 01dc5be: `hasForeignBinding` now passes over a binding with no value meaning inside the file — a type parameter, a local type alias or interface — and keeps looking outwards, because a type does not shadow the value, or the head of the qualified name, that a fix writes. Before, the rules that guard their fix with it reported code such as `function f<Arr>() { return xs.length > 0; }` but offered no fix; they now fix it. A rule that uses it to decide whether a call is the module's at all, such as `prefer-pipe-map-nullable` for `pipe`, now also reports a call made inside such a scope. A type-only binding at the top of the file still counts, because the import a fix adds there would conflict with it when the export also has a type meaning. `prefer-namespace-import` still gives up its fix where a type parameter or local type of the namespace name would capture a reference in a type position.

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
