# eslint-plugin-ts-type-forge

## 0.4.3

### Patch Changes

- Updated dependencies [e83818f]
    - ts-type-forge@9.1.1

## 0.4.2

### Patch Changes

- Updated dependencies [1132737]
    - ts-type-forge@9.1.0

## 0.4.1

### Patch Changes

- Updated dependencies [51b56e9]
- Updated dependencies [0e7e904]
    - ts-type-forge@9.0.0

## 0.4.0

### Minor Changes

- de25dea: Ship a `recommended` config preset. `eslintPluginTsTypeForge.configs.recommended`
  is a flat-config object that registers the plugin and enables every rule at
  `error`, so consuming projects can start from:

    ```ts
    export default [eslintPluginTsTypeForge.configs.recommended];
    ```

    The preset registers the exported plugin object itself, so listing the plugin in
    your own `plugins` record alongside the preset does not trigger ESLint's
    `Cannot redefine plugin` error.

    Also exports the `ESLintFlatConfig` type alongside the existing `ESLintPlugin`.

## 0.3.2

### Patch Changes

- Updated dependencies [296790b]
    - ts-type-forge@8.1.0

## 0.3.1

### Patch Changes

- Updated dependencies [94640c0]
- Updated dependencies [9d48fa8]
    - ts-type-forge@8.0.0

## 0.3.0

### Minor Changes

- 58880a3: Replace `prefer-non-empty-array` with **`prefer-canonical-length-constrained-tuple`**,
  a single rule covering the whole uniform-tuple family:

    | spelling                    | readonly target          | mutable target                  |
    | :-------------------------- | :----------------------- | :------------------------------ |
    | `[V, ...V[]]`               | `NonEmptyTuple<V>`       | `MutableNonEmptyTuple<V>`       |
    | `[V, …×N, ...V[]]` (N >= 2) | `MinLengthTuple<N, V>`   | `MutableMinLengthTuple<N, V>`   |
    | `[V, …×N]` (N >= 2)         | `FixedLengthTuple<N, V>` | `MutableFixedLengthTuple<N, V>` |

    `N` is bounded by the new `maxLength` option (default 10).

    **BREAKING CHANGE**: `prefer-non-empty-array` is removed; enable
    `prefer-canonical-length-constrained-tuple` instead. Beyond the rename, its
    target changed from `NonEmptyArray<V>` to `NonEmptyTuple<V>`:
    `NonEmptyArray<V>` is `MinLengthTuple<1, V>` intersected with a brand — a strict
    subtype of `readonly [V, ...V[]]` — so the previous autofix _narrowed_ the
    declared type and could break assignments from plain array literals. The
    structural `NonEmptyTuple<V>` is exactly equal to the spelled-out tuple, making
    every fix a pure rename.

## 0.2.0

### Minor Changes

- b49a8c8: Add `eslint-plugin-ts-type-forge`, an ESLint plugin whose rules steer type
  declarations toward ts-type-forge idioms.

    Its first rule, `prefer-non-empty-array`, reports the hand-rolled
    `readonly [V, ...V[]]` tuple spelling and auto-fixes it to `NonEmptyArray<V>`.
