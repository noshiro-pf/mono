# eslint-plugin-ts-data-forge

ESLint rules that steer TypeScript code toward [`ts-data-forge`](https://www.npmjs.com/package/ts-data-forge) idioms — e.g. preferring `Arr.isNonEmpty(xs)` over `xs.length > 0`, `isRecord(x) && hasKey(x, k)` over `Object.hasOwn(x, k)`, or `Num.safeParseInt` over `parseInt`. Every rule is auto-fixable.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-data-forge
```

Requires ESLint 9+ (flat config) and TypeScript. Some rules are type-aware and need a configured TypeScript project.

## Usage (flat config)

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
            'ts-data-forge/prefer-arr-is-non-empty': 'error',
            'ts-data-forge/prefer-is-record-and-has-key': 'error',
            // ...enable the rules you want
        } satisfies Partial<EslintTsDataForgeRules>,
    },
];
```

## Rules

| Rule                                   | Description                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `prefer-canonical-array-slicing`       | Unify non-mutating array add/remove patterns into `Arr.tail`/`skip`/`take`/etc.     |
| `prefer-arr-is-min-length-array`       | Replace `xs.length >= n` with `Arr.isMinLengthArray(xs, n)`.                        |
| `prefer-arr-is-max-length-array`       | Replace `xs.length <= n` with `Arr.isMaxLengthArray(xs, n)`.                        |
| `prefer-arr-is-bounded-length-array`   | Replace `xs.length >= min && xs.length <= max` with `Arr.isBoundedLengthArray(…)`.  |
| `prefer-arr-is-fixed-length-array`     | Replace `xs.length === n` with `Arr.isFixedLengthArray(xs, n)`.                     |
| `prefer-arr-is-array`                  | Replace `Array.isArray` with `Arr.isArray`.                                         |
| `prefer-arr-is-non-empty`              | Replace `xs.length > 0` with `Arr.isNonEmpty(xs)`.                                  |
| `prefer-arr-sum`                       | Replace `xs.reduce((a, b) => a + b, 0)` with `Arr.sum(xs)` / `Arr.sumBy(xs, fn)`.   |
| `prefer-as-int`                        | Replace branded-number assertions (`x as Int`) with `asInt(x)`-style casts.         |
| `prefer-is-non-null-object`            | Replace `typeof u === 'object' && u !== null` with `isNonNullObject(u)`.            |
| `prefer-range-for-loop`                | Replace C-style `for` loops with `for (const i of range(begin, end))`.              |
| `prefer-is-record-and-has-key`         | Replace `Object.hasOwn(obj, key)` / `key in obj` with `isRecord(obj) && hasKey(…)`. |
| `prefer-num-safe-parse-int`            | Replace `parseInt(x, 10)` with `Result.unwrapOkOr(Num.safeParseInt(x), NaN)`.       |
| `prefer-num-safe-parse-float`          | Replace `parseFloat(x)` / `Number(x)` with `Num.safeParseFloat`-based parsing.      |
| `no-unnecessary-type-guard`            | Flag `ts-data-forge` type-guard calls that do no narrowing (type-aware).            |
| `prefer-comparison-over-nullish-guard` | Prefer direct `=== null` / `!== undefined` over `isNull` / `isNotUndefined` calls.  |

## License

[Apache-2.0](./LICENSE)
