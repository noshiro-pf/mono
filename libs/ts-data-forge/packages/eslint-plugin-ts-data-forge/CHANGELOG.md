# eslint-plugin-ts-data-forge

## 0.2.0

### Minor Changes

- 534ac4d: **`Arr.isEmpty` and `Arr.isNonEmpty` now narrow to the branded length-constrained
  array types**, matching the rest of the `Arr` length-guard family.

    | guard                | before             | after                         |
    | :------------------- | :----------------- | :---------------------------- |
    | `Arr.isEmpty(xs)`    | `readonly []`      | `FixedLengthArray<0, E> & Xs` |
    | `Arr.isNonEmpty(xs)` | `NonEmptyArray<E>` | `MinLengthArray<1, E> & Xs`   |

    `isEmpty` was missing the brand entirely, so it was not equivalent to
    `Arr.isFixedLengthArray(xs, 0)`; `isNonEmpty` had the brand but dropped the input
    type instead of intersecting with it the way `Arr.isMinLengthArray` does. Both
    now behave exactly like their `is*LengthArray` counterparts.

    BREAKING CHANGE: the narrowed types are strictly narrower than before. Code that
    reads the narrowed value keeps compiling, but an explicit annotation such as
    `const empty: readonly [] = xs` after the guard, or passing the narrowed value
    where an unbranded array literal is expected, may now need the unbranded type
    spelled out.

    `prefer-canonical-length-guard` follows the new semantics: `isFixedLengthArray(xs, 0)`
    and `isMinLengthArray(xs, 1)` are now the _type-identical_ rewrites, and the
    structural `*Tuple` guards (`isFixedLengthTuple(xs, 0)`, `isMaxLengthTuple(xs, 0)`,
    `isBoundedLengthTuple(xs, 0, 0)`, `isMinLengthTuple(xs, 1)`) are rewritten too —
    those strengthen the narrowed type by adding the brand.

    `prefer-canonical-length-guard` additionally absorbs the five `xs.length <op> n`
    comparison rules — `prefer-arr-is-non-empty`, `prefer-arr-is-min-length-array`,
    `prefer-arr-is-max-length-array`, `prefer-arr-is-bounded-length-array` and
    `prefer-arr-is-fixed-length-array` — so one rule now covers both
    comparison → guard and guard → guard normalization.

    BREAKING CHANGE: those five rule names are removed from the plugin; enable
    `ts-data-forge/prefer-canonical-length-guard` instead. Their behavior is
    unchanged — the rule reuses their implementations rather than reimplementing
    them.

- 9dd4194: Ship a `recommended` config preset. `eslintPluginTsDataForge.configs.recommended`
  is a flat-config object that registers the plugin and enables every rule at
  `error`, so consuming projects can start from:

    ```ts
    export default [eslintPluginTsDataForge.configs.recommended];
    ```

    The preset registers the exported plugin object itself, so listing the plugin in
    your own `plugins` record alongside the preset does not trigger ESLint's
    `Cannot redefine plugin` error.

    Also exports the `ESLintFlatConfig` type alongside the existing `ESLintPlugin`.

- 534ac4d: Add the `prefer-canonical-length-guard` rule, which normalizes degenerate `Arr`
  length guards to their canonical spelling:

    - `Arr.isFixedLengthTuple(xs, 0)`, `Arr.isMaxLengthTuple(xs, 0)` and
      `Arr.isBoundedLengthTuple(xs, 0, 0)` → `Arr.isEmpty(xs)`
    - `Arr.isMinLengthArray(xs, 1)` → `Arr.isNonEmpty(xs)`

    Every rewrite narrows to exactly the same type, so the autofix is
    type-preserving.

### Patch Changes

- Updated dependencies [534ac4d]
    - ts-data-forge@13.0.0

## 0.1.7

### Patch Changes

- 8ef64f1: chore(deps): bump actions/checkout from 7.0.0 to 7.0.1
- 37cedcb: chore(deps): bump actions/setup-node from 6.4.0 to 7.0.0
- 6cb1c29: chore(deps): bump anthropics/claude-code-action from 1.0.177 to 1.0.178
- Updated dependencies [8ef64f1]
- Updated dependencies [37cedcb]
- Updated dependencies [6cb1c29]
    - ts-data-forge@12.2.2

## 0.1.6

### Patch Changes

- 59bfcbe: Fix how dependencies are specified.
- Updated dependencies [59bfcbe]
    - ts-data-forge@12.2.1

## 0.1.5

### Patch Changes

- Updated dependencies [36b9be2]
    - ts-data-forge@12.2.0

## 0.1.4

### Patch Changes

- Updated dependencies [1bf4200]
    - ts-data-forge@12.1.0

## 0.1.3

### Patch Changes

- Updated dependencies [db6c5f5]
    - ts-data-forge@12.0.0

## 0.1.2

### Patch Changes

- Updated dependencies [aec5752]
- Updated dependencies [bf3466d]
    - ts-data-forge@11.0.1

## 0.1.0

### Minor Changes

- f947b42: Initial release of `eslint-plugin-ts-data-forge`: 16 auto-fixable ESLint rules that steer TypeScript code toward `ts-data-forge` idioms (array length guards, `Arr` array helpers, branded-number casts, safe parsing, non-null-object checks, canonical array slicing, and removal of unnecessary type guards). The rules target the `ts-data-forge` v11 API and are versioned together with `ts-data-forge`.

    The package also exports typed rule-entry definitions — `EslintTsDataForgeRules` and `EslintTsDataForgeRulesOption` — mirroring `eslint-config-typed`, so consumers can type-check their rule configuration. These are auto-generated from the rule implementations (option types are derived at the type level from each rule's `TSESLint.RuleModule` signature), so they always stay in sync with the actual rules.
