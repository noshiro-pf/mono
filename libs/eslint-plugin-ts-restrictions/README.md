# eslint-plugin-ts-restrictions

ESLint rules for TypeScript: rules that catch code which type-checks but does
not do what it says (a date-only string read as UTC midnight, a `string` spread
into characters, a clock read once when a module loads), and rules that rewrite
code into one plain form (`??` where it cannot change behavior, an optional
chain for a nullish ternary, a range check in number-line order).

These are the `ts-restrictions/*` rules of
[`eslint-config-typed`](https://www.npmjs.com/package/eslint-config-typed),
published on their own. `eslint-config-typed` brings in about 25 third-party
ESLint plugins; this package depends on none of them, so it can be adopted
without that dependency tree. Its runtime dependencies are
`@typescript-eslint/utils`, `micromatch` (and its types),
`editorconfig-without-wasm`, and three packages from the same repository
(`eslint-rule-forge`, `ts-data-forge`, `ts-type-forge`).

## Installation

```sh
npm install --save-dev eslint-plugin-ts-restrictions @typescript-eslint/parser
```

`eslint` and `typescript` are peer dependencies; npm installs them within the
plugin's ranges when the project does not have them yet.

Requires ESLint 9+ (flat config) and TypeScript 5 or 6. Most rules read type
information, so files are parsed by `@typescript-eslint/parser` with a
TypeScript project (`projectService`, or `project`). The plugin does not install
the parser itself, since a project that lints TypeScript usually has one
already.

## Usage (flat config)

The `recommended` preset registers the plugin and turns on the rules
`eslint-config-typed` turns on, as it configures them. It applies to
`**/*.{ts,tsx,mts,cts}` only, because a rule that reads type information throws
on a file the TypeScript parser does not give a program:

```ts
// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginTsRestrictions } from 'eslint-plugin-ts-restrictions';

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
    eslintPluginTsRestrictions.configs.recommended,
];
```

The preset is a plain flat-config object, so a later entry can adjust a rule:

```ts
// eslint.config.mts
import {
    eslintPluginTsRestrictions,
    type EslintTsRestrictionsRules,
} from 'eslint-plugin-ts-restrictions';

export default [
    eslintPluginTsRestrictions.configs.recommended,
    {
        files: ['src/legacy/**'],
        rules: {
            'ts-restrictions/function-order': 'off',
            'ts-restrictions/prefer-ternary': 'off',
        } satisfies Partial<EslintTsRestrictionsRules>,
    },
];
```

Or register the plugin yourself and pick rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginTsRestrictions,
    type EslintTsRestrictionsRules,
} from 'eslint-plugin-ts-restrictions';

export default [
    {
        plugins: { 'ts-restrictions': eslintPluginTsRestrictions },
        rules: {
            'ts-restrictions/no-detached-jsdoc': 'error',
            'ts-restrictions/prefer-range-in-number-line-order': 'error',
        } satisfies Partial<EslintTsRestrictionsRules>,
    },
];
```

`EslintTsRestrictionsRules` types every rule's options, so a misspelled rule
name or option fails to type-check.

### With `eslint-config-typed`

`eslint-config-typed` already registers these rules under `ts-restrictions`,
together with two more that wrap rules of `eslint-plugin-promise` and
`eslint-plugin-unicorn` (`prefer-catch` and `prefer-global-this`), which is why
they are not here. Use one package or the other: ESLint refuses two different
plugin objects under the same name (`Cannot redefine plugin`).

## Rules

✓ in **Preset**: on in `recommended`. ✓ in **Types**: reads type information.
🔧: `--fix` rewrites what it reports.

| Rule                                  | Description                                                                                                                                                                                                                                                                                             | Preset | Types | Fix |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----: | :---: | :-: |
| `check-destructuring-completeness`    | Ensure all properties are destructured from an object when explicitly requested                                                                                                                                                                                                                         |   ✓    |   ✓   |     |
| `explicit-collection-type-arguments`  | Require explicit type arguments on `new Set` / `new Map` / `new WeakSet` / `new WeakMap` called with no argument or an array literal                                                                                                                                                                    |   ✓    |   ✓   | 🔧  |
| `function-order`                      | Require a module's exported functions before its non-exported helpers, and a helper before the helpers that call it                                                                                                                                                                                     |   ✓    |       | 🔧  |
| `jsx-boolean-logical-operands`        | Require booleans on both sides of `&&` and `\|\|` whose value is rendered or passed in JSX, and write the rest as a ternary (`{a && <X />}` → `{a ? <X /> : undefined}`).                                                                                                                               |   ✓    |   ✓   | 🔧  |
| `no-clock-read-at-module-load`        | Disallow reading the clock (`Date.now()`, `new Date()`) when a module loads, which keeps that moment for as long as the module lives                                                                                                                                                                    |   ✓    |       |     |
| `no-date-only-string-to-date`         | Disallow a date-only string (`YYYY-MM-DD`) read by `new Date` or `Date.parse`, which take it as midnight UTC rather than local midnight                                                                                                                                                                 |   ✓    |   ✓   |     |
| `no-detached-jsdoc`                   | Disallow a JSDoc block that TypeScript attaches to no node, so that it documents nothing                                                                                                                                                                                                                |   ✓    |       |     |
| `no-export-type-side-effects`         | Enforce a top-level `export type` qualifier on a re-export whose specifiers all have inline `type` qualifiers                                                                                                                                                                                           |   ✓    |       | 🔧  |
| `no-negated-comparison`               | Invert the operator of a negated comparison instead of negating it (`!(a === b)` → `a !== b`, `!(a < b)` → `a >= b` when no operand can be NaN).                                                                                                                                                        |   ✓    |   ✓   | 🔧  |
| `no-optional-phantom-property`        | Disallow an optional property keyed by a type-only symbol (`declare const tag: unique symbol`), which every value that lacks it satisfies                                                                                                                                                               |   ✓    |   ✓   |     |
| `no-ragged-comment-wrap`              | Disallow a comment paragraph wrapped unevenly: a line with room for the first word of the line after it                                                                                                                                                                                                 |   ✓    |       | 🔧  |
| `no-restricted-cast-name`             | Disallow type assertions with specified type names                                                                                                                                                                                                                                                      |        |       | 🔧  |
| `no-restricted-syntax`                | Disallow specified syntax                                                                                                                                                                                                                                                                               |        |       |     |
| `no-string-spread`                    | Disallow spreading a `string` (e.g. `[...str]`), which silently splits it into characters and yields a `string[]` indistinguishable from spreading an array                                                                                                                                             |   ✓    |   ✓   |     |
| `no-unnecessary-array-from`           | Disallow wrapping an array in `Array.from()` before a non-mutating array method (e.g. `Array.from(x).toSorted()`), since the method already returns a new array                                                                                                                                         |   ✓    |   ✓   | 🔧  |
| `no-unnecessary-coalesce-undefined`   | Require the left-hand side of `?? undefined` to include `null` in its type, and remove the redundant `?? undefined` otherwise                                                                                                                                                                           |   ✓    |   ✓   | 🔧  |
| `prefer-curried-call`                 | Replace a redundant arrow wrapper with the function itself (`(a) => f(a)` → `f`) or, when the callee has a curried version, its curried form (`(a) => f(a, ...rest)` → `f(...rest)`).                                                                                                                   |   ✓    |   ✓   | 🔧  |
| `prefer-dedent`                       | Require a string that spans source lines to be a tagged template (e.g. `` dedent`...` ``) rather than a bare multi-line template literal, whose value carries whatever indentation the source happens to have                                                                                           |   ✓    |       |     |
| `prefer-logical-over-boolean-ternary` | Replace a ternary with one boolean literal branch by `&&` or `\|\|` (`a ? false : b` → `!a && b`, `a ? true : b` → `a \|\| b`).                                                                                                                                                                         |   ✓    |   ✓   | 🔧  |
| `prefer-non-mutating-array-method`    | Disallow calling a mutating array method on a defensive `Array.from()` copy of an array (e.g. `Array.from(x).sort()`); use the non-mutating counterpart on the original array instead (e.g. `x.toSorted()`)                                                                                             |   ✓    |   ✓   | 🔧  |
| `prefer-nullish-coalescing-when-safe` | Enforce `??` over `\|\|` (and `??=` over `\|\|=`) for defaulting when the operand types prove the replacement cannot change the behavior (e.g. `<string \| undefined> \|\| ""`), and remove `\|\| <fallback>` entirely when a never-nullish left-hand side makes it redundant (e.g. `<string> \|\| ""`) |   ✓    |   ✓   | 🔧  |
| `prefer-optional-chain-over-ternary`  | Replace a ternary that yields `undefined` for a nullish value and an access on it otherwise by an optional chain (`x == null ? undefined : x.b` → `x?.b`).                                                                                                                                              |   ✓    |   ✓   | 🔧  |
| `prefer-range-in-number-line-order`   | Write a range check in the order of the number line (`x >= min && max >= x` → `min <= x && x <= max`, `min > x \|\| x > max` → `x < min \|\| max < x`).                                                                                                                                                 |   ✓    |       | 🔧  |
| `prefer-ternary`                      | Prefer ternary expressions over `if` statements, and chains of them, that only choose what to return or assign.                                                                                                                                                                                         |   ✓    |       | 🔧  |
| `require-ime-guard-on-enter`          | Require a keyboard handler that compares `event.key` or `event.code` with `'Enter'` to check the same event for input method composition                                                                                                                                                                |   ✓    |   ✓   |     |

`no-restricted-syntax` and `no-restricted-cast-name` report nothing until they
are told what to restrict, so the preset leaves them off.
`no-restricted-syntax` is ESLint's rule of the same name under another id: it
lets a config add selectors at a severity of their own without restating the
core rule's, since a later config entry replaces a rule's options whole.

```ts
// eslint.config.mts
import {
    eslintPluginTsRestrictions,
    type EslintTsRestrictionsRules,
} from 'eslint-plugin-ts-restrictions';

export default [
    {
        plugins: { 'ts-restrictions': eslintPluginTsRestrictions },
        rules: {
            'ts-restrictions/no-restricted-syntax': [
                'error',
                'WithStatement',
                {
                    selector: "CallExpression[callee.name='eval']",
                    message: 'Do not call `eval`.',
                },
            ],
        } satisfies Partial<EslintTsRestrictionsRules>,
    },
];
```

Each rule's source documents why it exists and what it leaves alone:
[`src/rules/`](https://github.com/noshiro-pf/mono/tree/main/libs/eslint-plugin-ts-restrictions/src/rules).

## License

Apache-2.0
