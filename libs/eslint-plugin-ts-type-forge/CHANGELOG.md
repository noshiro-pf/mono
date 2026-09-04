# eslint-plugin-ts-type-forge

## 0.8.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
    - ts-data-forge@14.6.3
    - ts-type-forge@9.2.2

## 0.8.0

### Minor Changes

- 71a69a3: Add `no-side-effect-import`, which reports and deletes a side-effect-only
  `import 'ts-type-forge';`. The package ships declarations and nothing else — its
  `exports` map offers no runtime condition — so the import binds no name and
  fails to resolve once the module graph is loaded, and a side-effect import is
  the one kind TypeScript never elides. Only the bare specifier matches:
  `ts-type-forge/global`, the ambient globals, is left alone.

    The rule is part of the `recommended` preset.

### Patch Changes

- ts-type-forge@9.2.2

## 0.7.3

### Patch Changes

- e69fe64: Update dependencies
- ts-type-forge@9.2.2

## 0.7.2

### Patch Changes

- Updated dependencies [d6124a5]
    - ts-data-forge@14.6.0
    - ts-type-forge@9.2.2

## 0.7.1

### Patch Changes

- Updated dependencies [4a69cc8]
    - ts-data-forge@14.5.0
    - ts-type-forge@9.2.2

## 0.7.0

### Minor Changes

- 255d850: Add the `prefer-canonical-mutable-record` rule, which normalizes
  `Mutable<Record<K, V>>` to the canonical ts-type-forge `MutableRecord<K, V>`.
  `Mutable` strips the `readonly` modifier from every property, so applied to a
  record utility it spells in two steps what `MutableRecord` says in one;
  `Mutable<ReadonlyRecord<K, V>>` and the redundant
  `Mutable<MutableRecord<K, V>>` collapse to the same type and are normalized the
  same way. The rewrite is exactly type-preserving, so the rule ships an autofix,
  which follows the configured `importStyle` and reuses an existing ts-type-forge
  import (aliases included). Qualified names and files that bind `Mutable` /
  `Record` / … themselves are left alone.

    The rule is part of the `recommended` config.

### Patch Changes

- 5eec163: `prefer-canonical-length-constrained-tuple` no longer rewrites a tuple that
  spells out a recursive type alias. A tuple literal is what lets TypeScript
  resolve `type T = readonly [T, T]`; routing the same cycle through
  `FixedLengthTuple` makes the alias an error type, and every use of it then
  reads as `any`. Cycles closed through another alias in the same file are
  detected too, and those are the common case.

    A cycle of any shape suppresses the rewrite, including the ones that would
    have compiled — `type Foo = { p: Pair }` closes a cycle that TypeScript
    resolves fine. Telling the two apart needs every use of every alias, so the
    rule leaves the tuple spelled out instead.

- Updated dependencies [698b13e]
    - ts-type-forge@9.2.2

## 0.6.6

### Patch Changes

- 332fd6b: Update dependencies
- Updated dependencies [1fe0b59]
    - ts-data-forge@14.4.0
    - ts-type-forge@9.2.1

## 0.6.5

### Patch Changes

- Updated dependencies [9810036]
    - ts-data-forge@14.3.0
    - ts-type-forge@9.2.1

## 0.6.4

### Patch Changes

- 4f8d4e3: Update dependencies
    - ts-type-forge@9.2.1

## 0.6.3

### Patch Changes

- 3d6bca7: Fix the links in the README. They were relative, and npm rewrites a relative
  link against the repository root without regard for `repository.directory`, so
  publishing from the monorepo would have pointed them at paths that do not
  exist — `synstate`'s logo among them. They are absolute now. The links that
  still named one of the repositories this package was merged from now name
  `mono`, and a handful that had gone stale independently (a file that moved, one
  that was renamed, three documents that became pages on the docs site) point
  where those things actually are.
- Updated dependencies [3d6bca7]
    - ts-data-forge@14.2.1
    - ts-type-forge@9.2.1

## 0.6.2

### Patch Changes

- Updated dependencies [ca73a82]
- Updated dependencies [d0a0a3d]
    - ts-type-forge@9.2.0

## 0.6.1

### Patch Changes

- Updated dependencies [f3ec911]
    - ts-type-forge@9.1.3

## 0.6.0

### Minor Changes

- 9619152: Two new rules, both enabled by `configs.recommended`:

    - **`prefer-strict-or-relaxed-utility-type`** — reports the standard library's
      `Exclude`, `Extract`, `Omit` and `Pick`, whose second argument is
      unconstrained, and points at the ts-type-forge pair that makes the choice
      explicit: `StrictExclude` / `RelaxedExclude`, `StrictExtract` /
      `RelaxedExtract`, `StrictOmit` / `RelaxedOmit`, `StrictPick` / `RelaxedPick`.
    - **`prefer-readonly-or-mutable-record`** — reports `Record`, whose mutability
      is unstated, and points at `ReadonlyRecord` / `MutableRecord`.

    Both report **suggestions** rather than an autofix: `Strict*` can turn working
    code into a compile error and `Record` maps onto two different types, so the
    choice is the author's. Editors offer both replacements (each one adding the
    `import { type … } from 'ts-type-forge'` it needs, unless
    `importStyle: 'global'`); `--fix` changes nothing. Qualified names
    (`Utils.Pick<…>`) and files that declare or import their own `Pick` / `Record`
    are left alone.

### Patch Changes

- Updated dependencies [9619152]
    - ts-type-forge@9.1.2

## 0.5.0

### Minor Changes

- 2dfecb5: `prefer-canonical-length-constrained-tuple` now adds the import its rewrite
  needs by default: `importStyle` defaults to `'named'`, so an autofix that
  introduces `FixedLengthTuple` also inserts
  `import { type FixedLengthTuple } from 'ts-type-forge';` when the name is not
  in scope yet. This matches how eslint-plugin-ts-data-forge's rules behave, and
  the inserted specifier is a `type` import, so it erases at compile time.

    Set `importStyle: 'global'` to restore the previous behavior in a project that
    loads the ambient globals of `ts-type-forge/global`.

### Patch Changes

- 38c6c36: Depend on `ts-data-forge` for array helpers and relax the
  `@typescript-eslint/utils` dependency to a `~` range.
- 38c6c36: `prefer-canonical-length-constrained-tuple` no longer rewrites tuples that
  appear in the `extends` clause of a conditional type. There a tuple is a match
  pattern: `[A, B] extends [true, true]` matches element-wise while `A` and `B`
  are still generic, whereas the canonical spellings resolve through a mapped
  type and make the checker defer the whole conditional, silently widening the
  result.

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
