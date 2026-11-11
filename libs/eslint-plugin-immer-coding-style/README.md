# eslint-plugin-immer-coding-style

ESLint rules for code that updates state with
[immer](https://immerjs.github.io/immer/): `produce` used in its curried form
where that is shorter, and a recipe's draft named with the `mut_` prefix, so
that a rule against mutation (`functional/immutable-data` with an
`ignoreIdentifierPattern` of `^mut_`) can allow the draft and nothing else.

The package also exports `mutablePrefix` (`'mut_'`), the prefix
`mut-prefixed-draft` asks for, for a config that sets up such a rule.

These are the `immer-coding-style/*` rules of
[`eslint-config-typed`](https://www.npmjs.com/package/eslint-config-typed),
published on their own: this package depends on none of the third-party ESLint
plugins `eslint-config-typed` brings in, so it can be adopted without them.

## Installation

```sh
npm install --save-dev eslint-plugin-immer-coding-style
```

`eslint` and `typescript` are peer dependencies; npm installs them within the
plugin's ranges when the project does not have them yet. Requires ESLint 9+
(flat config) and TypeScript 5 or 6.

## Usage (flat config)

The `recommended` preset registers the plugin and turns on the rules
`eslint-config-typed` turns on, as it configures them. It applies to every file
the config lints.

```ts
// eslint.config.mts
import { eslintPluginImmerCodingStyle } from 'eslint-plugin-immer-coding-style';

export default [eslintPluginImmerCodingStyle.configs.recommended];
```

Or register the plugin yourself and pick rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginImmerCodingStyle,
    type EslintImmerCodingStyleRules,
} from 'eslint-plugin-immer-coding-style';

export default [
    {
        plugins: { 'immer-coding-style': eslintPluginImmerCodingStyle },
        rules: {
            'immer-coding-style/prefer-curried-produce': 'error',
        } satisfies Partial<EslintImmerCodingStyleRules>,
    },
];
```

`EslintImmerCodingStyleRules` types every rule's options, so a misspelled rule
name or option fails to type-check.

### With `eslint-config-typed`

`eslint-config-typed` depends on this package and registers this very plugin
object under `immer-coding-style`, so a config may use both: ESLint accepts the
same object under one name twice. Only two installed copies of this package, at
versions npm could not share, are different objects, which ESLint refuses
(`Cannot redefine plugin`).

## Rules

✓ in **Preset**: on in `recommended`. 🔧: `--fix` rewrites what it reports. 💡: an editor offers a rewrite.

| Rule                     | Description                                                                   | Preset | Fix |
| :----------------------- | :---------------------------------------------------------------------------- | :----: | :-: |
| `mut-prefixed-draft`     | Require the `mut_` prefix on the draft parameter of an immer recipe.          |   ✓    | 🔧  |
| `prefer-curried-produce` | Prefer the curried overload of immer produce for shorter updater definitions. |   ✓    | 🔧  |

## License

Apache-2.0
