# eslint-plugin-ts-std-forge

ESLint rules that steer TypeScript code toward [`ts-std-forge`](https://www.npmjs.com/package/ts-std-forge) idioms — e.g. preferring `SafeArray.isNonEmpty(xs)` over `xs.length > 0`, `isRecord(x) && hasKey(x, k)` over `Object.hasOwn(x, k)`, or `SafeNumber.parseInteger` over `parseInt`. Every rule is auto-fixable.

## Relation to `eslint-plugin-ts-data-forge`

The two plugins overlap by construction. `ts-data-forge` used to own the
algebraic data type core and the guards; the D-49 dependency inversion moved
them into `ts-std-forge`, which `ts-data-forge` now re-exports from. This
plugin covers the part that moved, and names the new home:

| this plugin                        | its `ts-data-forge` counterpart | why they differ                                                                          |
| :--------------------------------- | :------------------------------ | :--------------------------------------------------------------------------------------- |
| `prefer-safe-number-parse`         | `prefer-num-safe-parse-float`   | `Num.safeParseFloat` delegates to `SafeNumber.parse` and adds a `FiniteNumber` brand     |
| `prefer-safe-number-parse-integer` | `prefer-num-safe-parse-int`     | `Num.safeParseInt` delegates to `SafeNumber.parseInteger` and adds an `Int` brand        |
| `prefer-safe-array-is-array`       | `prefer-arr-is-array`           | `SafeArray.isArray` is `Arr.isArray` without the branded-array machinery around it       |
| `prefer-safe-array-length-guard`   | `prefer-canonical-length-guard` | only the empty / non-empty half: ts-std-forge has no branded length family (D-26 / D-39) |
| `prefer-is-record-and-has-key`     | same name                       | same rule, pointing at `ts-std-forge`                                                    |
| `prefer-is-non-null-object`        | same name                       | same rule, pointing at `ts-std-forge`                                                    |

**Do not enable both plugins on the same files.** Every pair above would
report the same code twice with conflicting autofixes. Pick the package the
code actually depends on: `ts-std-forge` alone, or `ts-data-forge` (which
brings `ts-std-forge` with it, and whose rules point at the branded API).

The rest of `eslint-plugin-ts-data-forge` — the branded number and array
rules, `prefer-obj-over-entries-round-trip`, the nullish-guard rules — has no
counterpart here, because the API it names never moved.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-std-forge
```

Requires ESLint 9+ (flat config) and TypeScript. Most rules are type-aware and need a configured TypeScript project.

## Usage (flat config)

The plugin ships a `recommended` config preset that registers the plugin and
turns on **every** rule at `error`:

```ts
// eslint.config.mts
import { eslintPluginTsStdForge } from 'eslint-plugin-ts-std-forge';

export default [eslintPluginTsStdForge.configs.recommended];
```

Since the preset is a plain flat-config object, individual rules can be
adjusted by a later config entry:

```ts
// eslint.config.mts
import {
    eslintPluginTsStdForge,
    type EslintTsStdForgeRules,
} from 'eslint-plugin-ts-std-forge';

export default [
    eslintPluginTsStdForge.configs.recommended,
    {
        rules: {
            'ts-std-forge/prefer-safe-array-length-guard': 'off',
        } satisfies Partial<EslintTsStdForgeRules>,
    },
];
```

Or register the plugin yourself and pick the rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginTsStdForge,
    type EslintTsStdForgeRules,
} from 'eslint-plugin-ts-std-forge';

export default [
    {
        plugins: { 'ts-std-forge': eslintPluginTsStdForge },
        rules: {
            'ts-std-forge/prefer-is-record-and-has-key': 'error',
            'ts-std-forge/prefer-safe-array-is-array': 'error',
            // ...enable the rules you want
        } satisfies Partial<EslintTsStdForgeRules>,
    },
];
```

## Rules

| Rule                               | Description                                                                                                                                                 |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefer-is-non-null-object`        | Replace `typeof u === 'object' && u !== null` with `isNonNullObject(u)`.                                                                                    |
| `prefer-is-record-and-has-key`     | Replace `Object.hasOwn(obj, key)` / `key in obj` with `isRecord(obj) && hasKey(obj, key)`. Drops the `isRecord` half when the type already makes it true.   |
| `prefer-safe-array-is-array`       | Replace `Array.isArray(x)` with `SafeArray.isArray(x)`, which keeps the array members of a union instead of widening to `any[]`.                            |
| `prefer-safe-array-length-guard`   | Replace an emptiness check on an array (`xs.length === 0`, `> 0`, `>= 1`, `!== 0`) with `SafeArray.isEmpty(xs)` / `SafeArray.isNonEmpty(xs)`, which narrow. |
| `prefer-safe-number-parse`         | Replace `parseFloat(x)` / `Number.parseFloat(x)` / `Number(x)` (string argument) with `Result.unwrapOkOr(SafeNumber.parse(x), Number.NaN)`.                 |
| `prefer-safe-number-parse-integer` | Replace `parseInt(x)` / `Number.parseInt(x, 10)` with `Result.unwrapOkOr(SafeNumber.parseInteger(x), Number.NaN)`.                                          |

## License

[Apache-2.0](https://github.com/noshiro-pf/mono/blob/main/libs/eslint-plugin-ts-std-forge/LICENSE)
