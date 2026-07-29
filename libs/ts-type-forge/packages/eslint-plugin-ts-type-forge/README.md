# eslint-plugin-ts-type-forge

ESLint rules that steer TypeScript **type declarations** toward
[`ts-type-forge`](https://www.npmjs.com/package/ts-type-forge) idioms — replacing
hand-rolled uniform tuple spellings with the library's named length-constrained
tuple types. Every rule is auto-fixable, and every rewrite is **type-preserving**.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-type-forge
```

Requires ESLint 9+ (flat config) and TypeScript. No rule is type-aware, so a
configured TypeScript project is not required.

## Usage (flat config)

```ts
// eslint.config.mts
import {
    eslintPluginTsTypeForge,
    type EslintTsTypeForgeRules,
} from 'eslint-plugin-ts-type-forge';

export default [
    {
        plugins: { 'ts-type-forge': eslintPluginTsTypeForge },
        rules: {
            'ts-type-forge/prefer-canonical-length-constrained-tuple': 'error',
        } satisfies Partial<EslintTsTypeForgeRules>,
    },
];
```

## Rules

| Rule                                        | Description                                                                              |
| :------------------------------------------ | :--------------------------------------------------------------------------------------- |
| `prefer-canonical-length-constrained-tuple` | Replace hand-rolled uniform tuple spellings with the canonical ts-type-forge tuple type. |

It covers the whole uniform-tuple family:

| spelling                   | readonly target          | mutable target                  |
| :------------------------- | :----------------------- | :------------------------------ |
| `[V, ...V[]]`              | `NonEmptyTuple<V>`       | `MutableNonEmptyTuple<V>`       |
| `[V, …×N, ...V[]]` (N ≥ 2) | `MinLengthTuple<N, V>`   | `MutableMinLengthTuple<N, V>`   |
| `[V, …×N]` (N ≥ 2)         | `FixedLengthTuple<N, V>` | `MutableFixedLengthTuple<N, V>` |

### Why the `*Tuple` types and not `NonEmptyArray` / `MinLengthArray`

The `*Array` family (`NonEmptyArray`, `MinLengthArray`, `FixedLengthArray`, …)
encodes its length constraint in a **brand**: `NonEmptyArray<V>` is
`MinLengthTuple<1, V> & Brand<…>`, a strict _subtype_ of `readonly [V, ...V[]]`.
Rewriting a declaration to it would narrow the type — an array literal is not
assignable to a branded type — so the autofix could break call sites.

The `*Tuple` family is structural and therefore exactly equal to the spelled-out
tuple, which makes every fix in this plugin a pure rename.

### Examples

```ts
// ❌
type Names = readonly [string, ...string[]];
type Queue = [number, ...number[]];
type Rgb = readonly [number, number, number];
type AtLeastTwo = [string, string, ...string[]];

// ✅
type Names = NonEmptyTuple<string>;
type Queue = MutableNonEmptyTuple<number>;
type Rgb = FixedLengthTuple<3, number>;
type AtLeastTwo = MutableMinLengthTuple<2, string>;
```

Single-element tuples without a rest (`readonly [V]`) are left alone — they read
better as-is than `FixedLengthTuple<1, V>`.

### The rule deliberately leaves alone

- heterogeneous tuples (`readonly [string, number]`);
- labelled members (`readonly [head: V, ...tail: V[]]`), because rewriting them
  would silently drop the labels;
- optional members (`readonly [V, V?]`) and rest-only tuples (`[...V[]]`);
- files that already bind the target name to something else (a local alias, or
  an import from another module).

## Options

| Option        | Type                  | Default    | Description                                               |
| :------------ | :-------------------- | :--------- | :-------------------------------------------------------- |
| `importStyle` | `'global' \| 'named'` | `'global'` | How the ts-type-forge type is brought into scope.         |
| `maxLength`   | `integer`             | `10`       | Longest tuple `prefer-length-constrained-tuple` rewrites. |

- `'global'` — the ambient globals of `ts-type-forge/global` are in use
  (`/// <reference types="ts-type-forge/global" />`), so the autofix only
  rewrites the type and never touches imports.
- `'named'` — the autofix additionally inserts
  `import { type … } from 'ts-type-forge';` when the name is not imported yet.

Either way, if the file already imports the target type from `ts-type-forge`
(possibly under an alias), the autofix reuses that binding.

```ts
{
    rules: {
        'ts-type-forge/prefer-canonical-length-constrained-tuple': [
            'error',
            { importStyle: 'named', maxLength: 6 },
        ],
    },
}
```

## License

[Apache-2.0](./LICENSE)
