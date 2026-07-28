# eslint-plugin-ts-type-forge

ESLint rules that steer TypeScript **type declarations** toward
[`ts-type-forge`](https://www.npmjs.com/package/ts-type-forge) idioms — e.g.
preferring `NonEmptyArray<V>` over the hand-rolled `readonly [V, ...V[]]`
tuple spelling. Every rule is auto-fixable.

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
            'ts-type-forge/prefer-non-empty-array': 'error',
        } satisfies Partial<EslintTsTypeForgeRules>,
    },
];
```

## Rules

| Rule                     | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `prefer-non-empty-array` | Replace `readonly [V, ...V[]]` with `NonEmptyArray<V>`. |

### `prefer-non-empty-array`

`readonly [V, ...V[]]` is the hand-rolled spelling of "an array with at least
one element". `ts-type-forge` already exposes it as `NonEmptyArray<V>` (an
alias of `MinLengthArray<1, V>`), which reads better and stays consistent with
the rest of the length-constrained array family.

```ts
// ❌
type Names = readonly [string, ...string[]];
declare const head: (xs: readonly [number, ...(readonly number[])]) => number;

// ✅
type Names = NonEmptyArray<string>;
declare const head: (xs: NonEmptyArray<number>) => number;
```

The rule deliberately leaves alone:

- mutable tuples (`[V, ...V[]]`), which correspond to
  `MutableNonEmptyArray<V>` rather than `NonEmptyArray<V>`;
- longer minimum lengths (`readonly [V, V, ...V[]]` — that is
  `MinLengthArray<2, V>`);
- labelled members (`readonly [head: V, ...tail: V[]]`), because rewriting
  them would silently drop the labels;
- files that already bind the name `NonEmptyArray` to something else (a local
  alias, or an import from another module).

#### Options

| Option        | Type                  | Default    | Description                                               |
| ------------- | --------------------- | ---------- | --------------------------------------------------------- |
| `importStyle` | `'global' \| 'named'` | `'global'` | How `NonEmptyArray` is expected to be brought into scope. |

- `'global'` — the ambient globals of `ts-type-forge/global` are in use
  (`/// <reference types="ts-type-forge/global" />`), so the autofix only
  rewrites the type and never touches imports.
- `'named'` — the autofix additionally inserts
  `import { type NonEmptyArray } from 'ts-type-forge';` when the name is not
  imported yet.

Either way, if the file already imports `NonEmptyArray` from `ts-type-forge`
(possibly under an alias), the autofix reuses that binding.

```ts
{
    rules: {
        'ts-type-forge/prefer-non-empty-array': ['error', { importStyle: 'named' }],
    },
}
```

## License

[Apache-2.0](./LICENSE)
