# eslint-plugin-ts-std-forge

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
