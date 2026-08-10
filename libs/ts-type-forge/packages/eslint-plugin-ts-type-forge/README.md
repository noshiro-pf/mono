# eslint-plugin-ts-type-forge

ESLint rules that steer TypeScript **type declarations** toward
[`ts-type-forge`](https://www.npmjs.com/package/ts-type-forge) idioms — replacing
hand-rolled uniform tuple spellings with the library's named length-constrained
tuple types, and the standard library's under-specified `Exclude` / `Extract` /
`Omit` / `Pick` / `Record` with counterparts that state what was left implicit.
Every rewrite is **type-preserving**.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-type-forge
```

Requires ESLint 9+ (flat config) and TypeScript. No rule is type-aware, so a
configured TypeScript project is not required.

## Usage (flat config)

The plugin ships a `recommended` config preset that registers the plugin and
turns on **every** rule at `error`:

```ts
// eslint.config.mts
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';

export default [eslintPluginTsTypeForge.configs.recommended];
```

Since the preset is a plain flat-config object, individual rules can be
adjusted by a later config entry — for instance to pass [options](#options):

```ts
// eslint.config.mts
import {
    eslintPluginTsTypeForge,
    type EslintTsTypeForgeRules,
} from 'eslint-plugin-ts-type-forge';

export default [
    eslintPluginTsTypeForge.configs.recommended,
    {
        rules: {
            'ts-type-forge/prefer-canonical-length-constrained-tuple': [
                'error',
                { importStyle: 'named' },
            ],
        } satisfies Partial<EslintTsTypeForgeRules>,
    },
];
```

Or register the plugin yourself and pick the rules one by one:

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

| Rule                                        | Fix        | Description                                                                               |
| :------------------------------------------ | :--------- | :---------------------------------------------------------------------------------------- |
| `prefer-canonical-length-constrained-tuple` | autofix    | Replace hand-rolled uniform tuple spellings with the canonical ts-type-forge tuple type.  |
| `prefer-strict-or-relaxed-utility-type`     | suggestion | Replace `Exclude` / `Extract` / `Omit` / `Pick` with the `Strict*` or `Relaxed*` variant. |
| `prefer-readonly-or-mutable-record`         | suggestion | Replace `Record` with `ReadonlyRecord` or `MutableRecord`.                                |

### `prefer-canonical-length-constrained-tuple`

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

#### The rule deliberately leaves alone

- heterogeneous tuples (`readonly [string, number]`);
- labelled members (`readonly [head: V, ...tail: V[]]`), because rewriting them
  would silently drop the labels;
- optional members (`readonly [V, V?]`) and rest-only tuples (`[...V[]]`);
- files that already bind the target name to something else (a local alias, or
  an import from another module).

### `prefer-strict-or-relaxed-utility-type`

`Exclude<T, U>`, `Extract<T, U>`, `Omit<T, K>` and `Pick<T, K>` do not constrain
their second argument, so a member or key that is not part of `T` is silently
accepted — typically producing an empty result instead of the compile error that
would have pointed at the leftover of a rename.

ts-type-forge splits each one in two, and this rule makes the choice explicit:

| built-in        | checks the second argument | keeps the built-in behavior |
| :-------------- | :------------------------- | :-------------------------- |
| `Exclude<T, U>` | `StrictExclude<T, U>`      | `RelaxedExclude<T, U>`      |
| `Extract<T, U>` | `StrictExtract<T, U>`      | `RelaxedExtract<T, U>`      |
| `Omit<T, K>`    | `StrictOmit<T, K>`         | `RelaxedOmit<T, K>`         |
| `Pick<T, K>`    | `StrictPick<T, K>`         | `RelaxedPick<T, K>`         |

```ts
// ❌
type Remaining = Exclude<'a' | 'b' | 'c', 'a'>;
type PublicInfo = Omit<Person, 'email'>;

// ✅ — the key is checked against the union / `keyof T`
type Remaining = StrictExclude<'a' | 'b' | 'c', 'a'>;
type PublicInfo = StrictOmit<Person, 'email'>;

// ✅ — deliberately unchecked (the subtrahend need not be part of `T`)
type NonStrings = RelaxedExclude<string | number | boolean, string>;
```

Reach for `Relaxed*` when the second argument genuinely need not be part of the
first — a key set computed from a still deferred type parameter, or a subtraction
whose subtrahend is only partly present.

### `prefer-readonly-or-mutable-record`

`Record<K, V>` says nothing about whether the properties may be reassigned, so
the mutability of every record spelled with it is decided by whoever reads it.

```ts
// ❌
type Config = Record<string, string | number>;

// ✅
type Config = ReadonlyRecord<string, string | number>;
type Counters = MutableRecord<string, number>;
```

### Both rules deliberately leave alone

- qualified names (`Utils.Pick<…>`) — they never denote the standard-library
  type;
- files that declare or import their own `Pick` / `Record` / …, for the same
  reason;
- the choice itself: replacing `Exclude` with `StrictExclude` can turn working
  code into a compile error, and `Record` maps onto two different types, so
  these rules report **suggestions** rather than an autofix. Editors offer both
  replacements; `--fix` changes nothing.

## Options

`importStyle` is accepted by every rule; `maxLength` only by
`prefer-canonical-length-constrained-tuple`.

| Option        | Type                  | Default   | Description                                                         |
| :------------ | :-------------------- | :-------- | :------------------------------------------------------------------ |
| `importStyle` | `'global' \| 'named'` | `'named'` | How the ts-type-forge type is brought into scope.                   |
| `maxLength`   | `integer`             | `10`      | Longest tuple `prefer-canonical-length-constrained-tuple` rewrites. |

- `'global'` — the ambient globals of `ts-type-forge/global` are in use
  (`/// <reference types="ts-type-forge/global" />`), so the fix only rewrites
  the type and never touches imports.
- `'named'` — the fix additionally inserts
  `import { type … } from 'ts-type-forge';` when the name is not imported yet.

Either way, if the file already imports the target type from `ts-type-forge`
(possibly under an alias), the fix reuses that binding.

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
