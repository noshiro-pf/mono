# eslint-plugin-ts-std-forge

## 0.1.17

### Patch Changes

- ae82fef: An autofix that imports a name adds it inside the empty braces of `import {} from '<module>'` or `import D, {} from '<module>'`, where it wrote a duplicate declaration or `import D, { x }, {} from '<module>'`, a syntax error (through `eslint-rule-forge`'s `bindValueImports`).
- 5a9d62a: `prefer-num-safe-parse-int` and `prefer-num-safe-parse-float` (eslint-plugin-ts-data-forge), `prefer-safe-number-parse-integer` and `prefer-safe-number-parse` (eslint-plugin-ts-std-forge), and the `createPreferSafeParseInt` / `createPreferSafeParseFloat` factories they are built from (eslint-rule-forge) now offer their rewrite as a suggestion instead of applying it with `--fix`. The replacement parses some strings differently from the original: `parseInt('1e3')` is 1 and the rewrite 1000, `parseFloat('12px')` is 12 and the rewrite NaN, and `Number('')` is 0 and the rewrite NaN. The report is unchanged, and its message now says so. A lint run that relied on `--fix` to clear these reports now leaves them: apply the suggestion where the input allows it, or keep the original call with a disable comment that says why.
- Updated dependencies [ae82fef]
- Updated dependencies [7001f62]
- Updated dependencies [5a9d62a]
    - eslint-rule-forge@0.5.0
    - ts-std-forge@0.5.2

## 0.1.16

### Patch Changes

- 4d1597c: `prefer-safe-array-length-guard` (`eslint-plugin-ts-std-forge`) and `prefer-canonical-length-constrained-type` (`eslint-plugin-ts-fortress`) now bring a name into scope through `eslint-rule-forge`'s `bindValueImports`:

    - The name is added to the file's existing named import instead of a new declaration, so the fixed file passes `import-x/no-duplicates`. Where `prefer-safe-array-length-guard` has to add a declaration, a leading directive stays first.
    - A name imported only as a type (`import { type SafeArray }`) has its `type` dropped. One imported by `import type { … }` gets the report with no fix, instead of a call nothing imports as a value.
    - `prefer-safe-array-length-guard` writes an aliased import by its local name, in its message as well as its fix, and offers no fix where something other than the import is bound to `SafeArray`.
    - Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.

- ts-std-forge@0.5.2

## 0.1.15

### Patch Changes

- 2d09754: `eslint-rule-forge` gains `bindValueImports`, which gives the local names to write for a module's exports and the edits that bind them as values, and exports `hasCommentWithin` and `importedNameOf`. `bindValueImports` adds a name to an existing named import from the module, drops `type` from an inline type specifier, refuses when an import already binds the name to something else, and treats a missing `importKind` (ESLint's default parser) as a value import. A lone default import takes the name in braces (`import D, { x }`). `buildNamedImportFix` now inserts after the directive prologue and any comment on its last line, so `'use client';` stays a directive and an `eslint-disable-line` there keeps its line.

    The rules built by `createPreferArrayIsArray`, `createPreferIsNonNullObject`, `createPreferIsRecordAndHasKey`, `createPreferSafeParseInt` and `createPreferSafeParseFloat` (in `eslint-plugin-ts-data-forge` and `eslint-plugin-ts-std-forge`: `prefer-arr-is-array`, `prefer-safe-array-is-array`, `prefer-is-non-null-object`, `prefer-is-record-and-has-key`, `prefer-num-safe-parse-int`, `prefer-num-safe-parse-float`, `prefer-safe-number-parse`, `prefer-safe-number-parse-integer`) use it:

    - The name is added to the file's existing named import instead of a new declaration at the top, so the fixed file passes `import-x/no-duplicates` and a leading directive stays first.
    - A name imported only as a type (`import { type Arr }`) has its `type` dropped instead of being written as a value nothing imports; one imported by `import type { Arr }` gets no fix.
    - An aliased import is written by its local name.
    - No fix is offered where something other than the import is bound to the name.
    - Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.

- Updated dependencies [2d09754]
    - eslint-rule-forge@0.4.0
    - ts-std-forge@0.5.2

## 0.1.14

### Patch Changes

- df02523: Update dependencies
- df02523: Declare each rule's default options as `meta.defaultOptions` instead of the top-level `defaultOptions` that `@typescript-eslint/utils` 8.72 deprecates. ESLint 9.15 and later now merge them into `context.options` too, so a rule that is not configured sees its defaults there instead of an empty list; the defaults themselves are unchanged.
- Updated dependencies [df02523]
- Updated dependencies [df02523]
    - eslint-rule-forge@0.3.2
    - ts-std-forge@0.5.2

## 0.1.13

### Patch Changes

- ca74a91: Update dependencies
- Updated dependencies [ca74a91]
    - eslint-rule-forge@0.3.1
    - ts-std-forge@0.5.2

## 0.1.12

### Patch Changes

- 384b952: Every rule but `prefer-safe-array-length-guard` is now built from the rule
  factories in eslint-rule-forge, which eslint-plugin-ts-data-forge shares.
  `prefer-safe-array-is-array` no longer reports a computed member such as
  `Array[isArray](xs)`.
- Updated dependencies [384b952]
    - eslint-rule-forge@0.3.0
    - ts-std-forge@0.5.2

## 0.1.11

### Patch Changes

- Updated dependencies [079cb28]
    - ts-std-forge@0.5.2

## 0.1.10

### Patch Changes

- a094d4c: `prefer-is-non-null-object` now reports the other ways of writing `typeof u === 'object' && u !== null`: the two halves in reverse order, either comparison with its operands swapped (`'object' === typeof u`, `null !== u`), `u != null` (which `typeof u === 'object'` has already made the same check), and the pair anywhere in a longer `&&` chain (`typeof u === 'object' && u !== null && 'k' in u` becomes `isNonNullObject(u) && 'k' in u`). The two halves have to be next to each other in the chain. The `eslint-plugin-ts-data-forge` version now also reads the two halves through type wrappers around each of them, as the `eslint-plugin-ts-std-forge` version already did.
- 9d79d74: `prefer-is-record-and-has-key` no longer offers rewrites that change what the code does. An object whose type may be an array (an array, a tuple, a union with one, or a record widened by `as` to one that may be an array) is not reported, because `isRecord` rejects an array and `'0' in xs` would turn from `true` to `false`; `object` and `unknown` say nothing either way and are reported as before. An object with side effects, such as a call or a comma expression, is reported without a fix when the rewrite needs `isRecord`, because `isRecord(obj) && hasKey(obj, key)` would evaluate it twice; when the object is known to be a record, `hasKey(obj, key)` reads it once and the fix stays. The `eslint-plugin-ts-data-forge` version now also keeps the parentheses of a comma expression in the fix and reads `Object` in `Object.hasOwn` through type wrappers, as the `eslint-plugin-ts-std-forge` version already did.
- Updated dependencies [fba7527]
    - eslint-rule-forge@0.2.0
    - ts-std-forge@0.5.1

## 0.1.9

### Patch Changes

- af7d748: `EslintTsStdForgeRulesOption` is now `ReadonlyRecord<never, never>` instead of `Readonly<{}>`. No rule of this plugin takes options, and `Readonly<{}>` accepted any non-nullish value.
- f67cb1d: `prefer-safe-number-parse`, `prefer-safe-number-parse-integer`, `prefer-safe-array-length-guard` and `prefer-is-record-and-has-key` draw a conclusion from a type only when it holds at every layer of type wrappers. They no longer report, or drop the `isRecord` guard, when a widening `as` says the value may be something else (`Number(s as string | boolean)`), nor when only a `!` makes an optional value look like a string, an array or a record (`parseFloat(s!)` on `string | undefined`).
- ts-std-forge@0.5.1

## 0.1.8

### Patch Changes

- 01d19b3: Read every `import … from 'ts-std-forge'` declaration rather than only the first, so that a fix no longer adds an import a second declaration already has. The rule helpers now come from the new `eslint-rule-forge` package instead of a copy in this one.
- ts-std-forge@0.5.1

## 0.1.7

### Patch Changes

- d299586: Update dependencies
- ts-std-forge@0.5.1

## 0.1.6

### Patch Changes

- 2a22af0: Update dependencies
- ts-std-forge@0.5.1

## 0.1.5

### Patch Changes

- 8dbc056: Read through `as`, `satisfies`, `!` and `<T>`, and keep the parentheses the
  source writes around an operand when a fix moves or removes it.

    eslint-plugin-ts-fortress:

    - `ts-fortress/prefer-canonical-length-constrained-type`: a parenthesized
      bound, or a parenthesized argument after a dropped bound, made the fix
      unparsable: `t.minLengthArray((1), t.string())` became
      `t.nonEmptyArray((t.string());`. The fix now removes the dropped bound with
      its own parentheses and leaves those of the next argument alone. A bound
      written `1 satisfies number` or `1 as const` is read as `1`; `1 as number`
      is still left alone, because it widens the length the call infers.
    - `ts-fortress/prefer-schema-over-guard-chain`: a guard on `(x as R).a`,
      `x satisfies T`, `<T>x` or `x!` counts towards `x`, and so does a guard call
      or a link of the chain that is itself wrapped.

    eslint-plugin-ts-std-forge:

    - `ts-std-forge/prefer-safe-number-parse` and
      `ts-std-forge/prefer-safe-number-parse-integer`: the argument is judged by
      the type of its value, not of a cast. `Number(b as unknown as string)` on a
      boolean was rewritten to `SafeNumber.parse`, turning 1 into `NaN`, and is
      now left alone. A radix written `10 as const` counts as 10, and a
      sequence argument `(a, s)` keeps its parentheses in the fix.
    - `ts-std-forge/prefer-safe-array-is-array`: the fix of `(Array.isArray)(x)`
      cut the call at the wrong place and left unparsable code. It now replaces
      the callee together with its parentheses. `(Array as ArrayConstructor).isArray(x)` and
      `Array!.isArray(x)` are reported.
    - `ts-std-forge/prefer-is-record-and-has-key`: `isRecord` is dropped only when
      the value, not a cast, is already a record. An array cast to
      `Record<string, unknown>` used to lose the check, which `isRecord` fails
      for an array, so the result could turn from `false` to `true`. A sequence
      object or key keeps its parentheses, so `'k' in (a, o)` no longer becomes
      `hasKey(a, o, 'k')`. `(Object as ObjectConstructor).hasOwn(o, k)` is
      reported.
    - `ts-std-forge/prefer-is-non-null-object`: finds
      `typeof (u satisfies unknown) === 'object' && u! !== null` and the other
      wrapped spellings of the check.
    - `ts-std-forge/prefer-safe-array-length-guard`: finds `xs.length > (0 as const)`,
      `(xs.length as number) > 0` and `xs.length! > 0`. The array is judged by the
      type of its value, so a string cast to an array is left alone, and a
      sequence `(a, xs)` keeps its parentheses in the fix.

- ts-std-forge@0.5.1

## 0.1.4

### Patch Changes

- 6e76d33: Update dependencies
- ts-std-forge@0.5.1

## 0.1.3

### Patch Changes

- fe4a4d2: Update dependencies
- ts-std-forge@0.5.1

## 0.1.2

### Patch Changes

- Updated dependencies [6e23aed]
    - ts-std-forge@0.5.1

## 0.1.1

### Patch Changes

- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
    - ts-std-forge@0.5.0
