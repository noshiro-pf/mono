# eslint-plugin-synstate-dom-a11y

The accessibility rules of
[`eslint-plugin-jsx-a11y`](https://www.npmjs.com/package/eslint-plugin-jsx-a11y),
for components written with
[`synstate-dom`](https://www.npmjs.com/package/synstate-dom).

synstate-dom takes every attribute as a `Bindable`, so a fixed value is written
`role={constant('button')}`. jsx-a11y reads that value as the text
`constant('button')`, or as no value at all, so it reports a `<div>` whose role
is given and lets a misspelt role through. synstate-dom also names an attribute
by its DOM property (`autofocus`) where React writes `autoFocus`, which
`no-autofocus` does not recognize. This plugin runs every jsx-a11y rule on a
copy of the JSX in which:

- an attribute bound to `constant(x)` is bound to `x`, for `constant` imported
  from `synstate-dom` under any name or through a namespace import;
- an attribute is named by React's spelling where synstate-dom's differs and a
  rule compares the name with React's exactly (`autofocus`);
- `prefer-tag-over-role` skips an SVG element: the HTML tag it asks for
  (`<button>`, `<img>`) cannot stand inside an `<svg>`.

A file that imports no `constant` from synstate-dom and writes none of those
names gets the rules unchanged. The rules keep jsx-a11y's names and options,
under `synstate-dom-a11y/` instead of `jsx-a11y/`.

## Installation

```sh
npm install --save-dev eslint-plugin-synstate-dom-a11y
```

`eslint-plugin-jsx-a11y` comes with it. `eslint` and `typescript` are peer
dependencies. Requires ESLint 9+ (flat config). The rules read no type
information; a TypeScript file needs a parser that reads TypeScript, such as
`@typescript-eslint/parser`.

## Usage (flat config)

`configs.recommended` and `configs.strict` are jsx-a11y's presets of the same
names, renamed to `synstate-dom-a11y/`. Apply one to the files written with
synstate-dom:

```ts
// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginSynstateDomA11y } from 'eslint-plugin-synstate-dom-a11y';

export default [
    {
        files: ['src/**/*.tsx'],
        languageOptions: { parser: tsParser },
    },
    {
        // The components written with synstate-dom. Leave out any file jsx-a11y's
        // own preset covers, or every finding there is reported twice.
        files: ['src/**/*.tsx'],
        ...eslintPluginSynstateDomA11y.configs.recommended,
    },
];
```

To turn a rule off or give it options, name it as jsx-a11y does, under this
prefix: `'synstate-dom-a11y/no-autofocus': 'off'`.

### With `eslint-config-typed`

[`eslint-config-typed`](https://www.npmjs.com/package/eslint-config-typed)
registers this plugin under `synstate-dom-a11y` and turns its rules on in
`eslintConfigForSynstateDom`, with the jsx-a11y settings it gives React code. A
project that uses it needs neither preset here.

### Wrapping another copy of jsx-a11y

`withSynstateDomConstants(plugin)` returns the `meta` and `rules` of a jsx-a11y
plugin module with the reading above, for a project that pins its own jsx-a11y.

## License

[Apache-2.0](https://github.com/noshiro-pf/mono/blob/main/libs/eslint-plugin-synstate-dom-a11y/LICENSE)
