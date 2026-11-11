# eslint-plugin-react-coding-style

ESLint rules for one way of writing React function components: wrapped in
`React.memo` with a `Props` type parameter, `React` imported as a namespace, a
single JSX return, values computed in render memoized. Why each rule exists,
with examples, is in [`RULES.md`](./RULES.md).

These are the `react-coding-style/*` rules of
[`eslint-config-typed`](https://www.npmjs.com/package/eslint-config-typed),
published on their own: this package depends on none of the third-party ESLint
plugins `eslint-config-typed` brings in, so it can be adopted without them.

## Installation

```sh
npm install --save-dev eslint-plugin-react-coding-style
```

`eslint` and `typescript` are peer dependencies; npm installs them within the
plugin's ranges when the project does not have them yet. Requires ESLint 9+
(flat config) and TypeScript 5 or 6.

## Usage (flat config)

The `recommended` preset registers the plugin and turns on the rules
`eslint-config-typed` turns on, as it configures them. Give it the files it is
for, as below: `files: ['**/*.tsx']`.

```ts
// eslint.config.mts
import { eslintPluginReactCodingStyle } from 'eslint-plugin-react-coding-style';

export default [
    {
        ...eslintPluginReactCodingStyle.configs.recommended,
        files: ['**/*.tsx'],
    },
];
```

The preset sets `componentWrappers: ['memoNamed']` on `require-use-memo` and
`single-jsx-return`, naming the `React.memo` wrapper `eslint-config-typed`'s own
projects use; a project without one loses nothing by it.

Or register the plugin yourself and pick rules one by one:

```ts
// eslint.config.mts
import {
    eslintPluginReactCodingStyle,
    type EslintReactCodingStyleRules,
} from 'eslint-plugin-react-coding-style';

export default [
    {
        plugins: { 'react-coding-style': eslintPluginReactCodingStyle },
        rules: {
            'react-coding-style/component-var-type-annotation': 'error',
        } satisfies Partial<EslintReactCodingStyleRules>,
    },
];
```

`EslintReactCodingStyleRules` types every rule's options, so a misspelled rule
name or option fails to type-check.

### With `eslint-config-typed`

`eslint-config-typed` depends on this package and registers this very plugin
object under `react-coding-style`, so a config may use both: ESLint accepts the
same object under one name twice. Only two installed copies of this package, at
versions npm could not share, are different objects, which ESLint refuses
(`Cannot redefine plugin`).

## Rules

✓ in **Preset**: on in `recommended`. 🔧: `--fix` rewrites what it reports. 💡: an editor offers a rewrite.

| Rule                             | Description                                                                                                                  | Preset | Fix |
| :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :----: | :-: |
| `ban-use-imperative-handle-hook` | Restricts specific React hook usage patterns for consistent component styles.                                                |   ✓    |     |
| `component-name`                 | Enforces naming conventions for variables assigned to React.memo(...) components.                                            |   ✓    |     |
| `component-var-type-annotation`  | Disallows using React.FC / React.FunctionComponent type annotations.                                                         |   ✓    |     |
| `display-name`                   | Require React.memo components to define displayName matching the component name                                              |   ✓    |     |
| `import-style`                   | Enforces importing React with a specific style (namespace or named imports).                                                 |   ✓    |     |
| `props-type-annotation-style`    | Forbids annotating props directly in the arrow function passed to React.memo.                                                |   ✓    |     |
| `react-memo-props-argument-name` | Enforces the arrow function passed to React.memo to use a single argument named 'props'.                                     |   ✓    |     |
| `react-memo-type-parameter`      | Requires React.memo calls to have the type parameter 'Props'.                                                                |   ✓    |     |
| `require-react-memo`             | Requires React components to be wrapped with React.memo.                                                                     |   ✓    |     |
| `require-use-memo`               | Requires a value a React component or hook computes on every render to be memoized unless it is a primitive O(1) expression. |   ✓    |     |
| `single-jsx-return`              | Requires a function that returns JSX to have only one return statement.                                                      |   ✓    |     |
| `use-memo-hook-style`            | Restricts React.useMemo hook usage patterns for consistent styles.                                                           |   ✓    |     |

## License

Apache-2.0
