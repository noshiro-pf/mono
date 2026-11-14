# eslint-plugin-ts-ui-restrictions

ESLint rules for TypeScript code that runs a user interface: rules that catch a
keyboard handler or a JSX expression which type-checks but does not do what it
says (an Enter that submits a half-typed input method conversion, a `0` rendered
where `{count && <List />}` meant to render nothing).

These are the `ts-ui-restrictions/*` rules of
[`eslint-config-typed`](https://www.npmjs.com/package/eslint-config-typed),
published on their own. `eslint-config-typed` brings in about 25 third-party
ESLint plugins; this package depends on none of them, so it can be adopted
without that dependency tree. Its runtime dependencies are
`@typescript-eslint/utils` and three packages from the same repository
(`eslint-rule-forge`, `ts-data-forge`, `ts-type-forge`).

Rules about TypeScript code in general are in
[`eslint-plugin-ts-restrictions`](https://www.npmjs.com/package/eslint-plugin-ts-restrictions).

## Installation

```sh
npm install --save-dev eslint-plugin-ts-ui-restrictions @typescript-eslint/parser
```

`eslint` and `typescript` are peer dependencies; npm installs them within the
plugin's ranges when the project does not have them yet.

Requires ESLint 9+ (flat config) and TypeScript 5 or 6. Both rules read type
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
import { eslintPluginTsUiRestrictions } from 'eslint-plugin-ts-ui-restrictions';

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
    eslintPluginTsUiRestrictions.configs.recommended,
];
```

`require-ime-guard` counts a call of `isImeKeyDown` (which `synstate-dom`
exports) with the event as a check. A project with a guard of its own names it
in `guardFunctions`; `keys` limits the rule to Enter or to Escape:

```ts
// eslint.config.mts
import {
    eslintPluginTsUiRestrictions,
    type EslintTsUiRestrictionsRules,
} from 'eslint-plugin-ts-ui-restrictions';

export default [
    eslintPluginTsUiRestrictions.configs.recommended,
    {
        rules: {
            'ts-ui-restrictions/require-ime-guard': [
                'error',
                {
                    guardFunctions: ['isImeKeyDown', 'isComposingKey'],
                    keys: ['Enter'],
                },
            ],
        } satisfies Partial<EslintTsUiRestrictionsRules>,
    },
];
```

`EslintTsUiRestrictionsRules` types every rule's options, so a misspelled rule
name or option fails to type-check.

### With `eslint-config-typed`

`eslint-config-typed` registers this very plugin object under
`ts-ui-restrictions`, so its config and this preset can be used together. Until
its next major, it also keeps each rule under the id it had in `ts-restrictions`
(`ts-restrictions/jsx-boolean-logical-operands`,
`ts-restrictions/require-ime-guard-on-enter`), deprecated and turned off, so
that a config or an `eslint-disable` comment naming the old id still loads. Its
types accept only `0` for a deprecated id, as for any deprecated rule, so a
type-checked config that sets an old id otherwise has to name the new one.

## Rules

✓ in **Preset**: on in `recommended`. ✓ in **Types**: reads type information.
🔧: `--fix` rewrites what it reports.

| Rule                           | Description                                                                                                                                                               | Preset | Types | Fix |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----: | :---: | :-: |
| `jsx-boolean-logical-operands` | Require booleans on both sides of `&&` and `\|\|` whose value is rendered or passed in JSX, and write the rest as a ternary (`{a && <X />}` → `{a ? <X /> : undefined}`). |   ✓    |   ✓   | 🔧  |
| `require-ime-guard`            | Require a keyboard handler that compares `event.key` or `event.code` with `'Enter'` or `'Escape'` to check the same event for input method composition                    |   ✓    |   ✓   |     |

Each rule's source documents why it exists and what it leaves alone:
[`src/rules/`](https://github.com/noshiro-pf/mono/tree/main/libs/eslint-plugin-ts-ui-restrictions/src/rules).

## License

Apache-2.0
