# eslint-plugin-ts-data-forge

ESLint rules that steer TypeScript code toward [`ts-data-forge`](https://www.npmjs.com/package/ts-data-forge) idioms — e.g. preferring `Arr.isNonEmpty(xs)` over `xs.length > 0`, `isRecord(x) && hasKey(x, k)` over `Object.hasOwn(x, k)`, or `Num.safeParseInt` over `parseInt`. Every rule is auto-fixable.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-data-forge
```

Requires ESLint 9+ (flat config) and TypeScript. Some rules are type-aware and need a configured TypeScript project.

## Usage (flat config)

The plugin ships a `recommended` config preset that registers the plugin and
turns on **every** rule at `error`:

```ts
// eslint.config.mts
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';

export default [eslintPluginTsDataForge.configs.recommended];
```

Since the preset is a plain flat-config object, individual rules can be
adjusted by a later config entry:

```ts
// eslint.config.mts
import {
    eslintPluginTsDataForge,
    type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';

export default [
    eslintPluginTsDataForge.configs.recommended,
    {
        rules: {
            'ts-data-forge/prefer-range-for-loop': 'off',
        } satisfies Partial<EslintTsDataForgeRules>,
    },
];
```

Or register the plugin yourself and pick the rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginTsDataForge,
    type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';

export default [
    {
        plugins: { 'ts-data-forge': eslintPluginTsDataForge },
        rules: {
            'ts-data-forge/prefer-canonical-length-guard': 'error',
            'ts-data-forge/prefer-is-record-and-has-key': 'error',
            // ...enable the rules you want
        } satisfies Partial<EslintTsDataForgeRules>,
    },
];
```

## Rules

| Rule                                   | Description                                                                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefer-canonical-array-slicing`       | Unify non-mutating array add/remove patterns into `Arr.tail`/`skip`/`take`/etc.                                                                      |
| `prefer-canonical-length-guard`        | Normalize array-length checks to the canonical `Arr` guard (`xs.length > 0` → `Arr.isNonEmpty`, `Arr.isFixedLengthTuple(xs, 0)` → `Arr.isEmpty`, …). |
| `prefer-arr-is-array`                  | Replace `Array.isArray` with `Arr.isArray`.                                                                                                          |
| `prefer-arr-sum`                       | Replace `xs.reduce((a, b) => a + b, 0)` with `Arr.sum(xs)` / `Arr.sumBy(xs, fn)`.                                                                    |
| `prefer-as-int`                        | Replace branded-number assertions (`x as Int`) with `asInt(x)`-style casts.                                                                          |
| `prefer-is-non-null-object`            | Replace `typeof u === 'object' && u !== null` with `isNonNullObject(u)`.                                                                             |
| `prefer-range-for-loop`                | Replace C-style `for` loops with `for (const i of range(begin, end))`.                                                                               |
| `prefer-is-record-and-has-key`         | Replace `Object.hasOwn(obj, key)` / `key in obj` with `isRecord(obj) && hasKey(…)`.                                                                  |
| `prefer-num-safe-parse-int`            | Replace `parseInt(x, 10)` with `Result.unwrapOkOr(Num.safeParseInt(x), NaN)`.                                                                        |
| `prefer-num-safe-parse-float`          | Replace `parseFloat(x)` / `Number(x)` with `Num.safeParseFloat`-based parsing.                                                                       |
| `no-unnecessary-type-guard`            | Flag `ts-data-forge` type-guard calls that do no narrowing (type-aware).                                                                             |
| `prefer-comparison-over-nullish-guard` | Prefer direct `=== null` / `!== undefined` over `isNull` / `isNotUndefined` calls.                                                                   |

## License

[Apache-2.0](./LICENSE)
