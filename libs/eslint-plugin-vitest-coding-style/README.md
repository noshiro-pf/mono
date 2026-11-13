# eslint-plugin-vitest-coding-style

ESLint rules that steer Vitest assertions toward `assert`: `assert.isTrue(x)`
over `expect(x).toBe(true)`, `assert.deepStrictEqual` over `toStrictEqual`, and
`assert.strictEqual` for primitives. Unlike `expect`, `assert.isTrue` and its
kin narrow the type of what they check, so the code after them needs no cast or
`!`. Three rules read type information, to tell a boolean or a primitive from
anything else, so files are parsed by `@typescript-eslint/parser` with a
TypeScript project.

These are the `vitest-coding-style/*` rules of
[`eslint-config-typed`](https://www.npmjs.com/package/eslint-config-typed),
published on their own: this package depends on none of the third-party ESLint
plugins `eslint-config-typed` brings in, so it can be adopted without them.

## Installation

```sh
npm install --save-dev eslint-plugin-vitest-coding-style @typescript-eslint/parser
```

`eslint` and `typescript` are peer dependencies; npm installs them within the
plugin's ranges when the project does not have them yet. Requires ESLint 9+
(flat config) and TypeScript 5 or 6.

## Usage (flat config)

The `recommended` preset registers the plugin and turns on the rules
`eslint-config-typed` turns on, as it configures them. It applies to
`**/*.{ts,tsx,mts,cts}` only, because a rule that reads type information throws
on a file the TypeScript parser does not give a program; narrow it to the files
it is for, as below: `files: ['**/*.test.{ts,mts,tsx}']`.

```ts
// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginVitestCodingStyle } from 'eslint-plugin-vitest-coding-style';

export default [
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        ...eslintPluginVitestCodingStyle.configs.recommended,
        files: ['**/*.test.{ts,mts,tsx}'],
    },
];
```

Or register the plugin yourself and pick rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginVitestCodingStyle,
    type EslintVitestCodingStyleRules,
} from 'eslint-plugin-vitest-coding-style';

export default [
    {
        plugins: { 'vitest-coding-style': eslintPluginVitestCodingStyle },
        rules: {
            'vitest-coding-style/prefer-assert-is-true-over-expect-true':
                'error',
        } satisfies Partial<EslintVitestCodingStyleRules>,
    },
];
```

`EslintVitestCodingStyleRules` types every rule's options, so a misspelled rule
name or option fails to type-check.

### With `eslint-config-typed`

`eslint-config-typed` depends on this package and registers this very plugin
object under `vitest-coding-style`, so a config may use both: ESLint accepts the
same object under one name twice. Only two installed copies of this package, at
versions npm could not share, are different objects, which ESLint refuses
(`Cannot redefine plugin`).

## Rules

✓ in **Preset**: on in `recommended`. 🔧: `--fix` rewrites what it reports. 💡: an editor offers a rewrite.

| Rule                                                 | Description                                                                                                                                                                                                                                                                                                                                | Preset | Fix |
| :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | :-: |
| `no-expect-to-strict-equal`                          | Disallow `expect(X).toStrictEqual(Y)` (and `expect(X, message)`) in favor of `assert.deepStrictEqual(X, Y)` (`assert.deepStrictEqual(X, Y, message)`), which constrains X and Y to a single type at compile time (`toStrictEqual` type-checks neither); note that it compares structure only, so pin a prototype with `assert.instanceOf`. |   ✓    | 🔧  |
| `prefer-assert-deep-strict-equal-over-deep-equal`    | Prefer assert.deepStrictEqual(X) over assert.deepEqual(X).                                                                                                                                                                                                                                                                                 |   ✓    | 🔧  |
| `prefer-assert-is-false-over-assert-not-ok`          | Prefer assert.isFalse(X) over assert.isNotOk(X), assert.notOk(X).                                                                                                                                                                                                                                                                          |   ✓    | 🔧  |
| `prefer-assert-is-false-over-expect-false`           | Prefer assert.isFalse(X) over expect(X).toBe(false) (only if X is boolean)                                                                                                                                                                                                                                                                 |   ✓    | 🔧  |
| `prefer-assert-is-false-over-negated-assert-is-true` | Prefer assert.isFalse(X) over assert.isTrue(!X).                                                                                                                                                                                                                                                                                           |   ✓    | 🔧  |
| `prefer-assert-is-true-over-assert`                  | Prefer assert.isTrue(X) over assert(X), assert.isOk(X), assert.ok(X).                                                                                                                                                                                                                                                                      |   ✓    | 🔧  |
| `prefer-assert-is-true-over-expect-true`             | Prefer assert.isTrue(X) over expect(X).toBe(true) (only if X is boolean)                                                                                                                                                                                                                                                                   |   ✓    | 🔧  |
| `prefer-assert-is-true-over-negated-assert-is-false` | Prefer assert.isTrue(X) over assert.isFalse(!X).                                                                                                                                                                                                                                                                                           |   ✓    | 🔧  |
| `prefer-assert-strict-equal-for-primitives`          | Prefer assert.strictEqual(X, Y) over assert.deepStrictEqual(X, Y) when X and Y are primitives (only a suggestion when both may be NaN or a zero, which the two compare differently).                                                                                                                                                       |   ✓    | 🔧  |

## License

Apache-2.0
