# eslint-plugin-ts-fortress

ESLint rules that steer schema definitions toward
[`ts-fortress`](https://www.npmjs.com/package/ts-fortress) idioms. Every rule is
auto-fixable.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-fortress
```

Requires ESLint 9+ (flat config) and TypeScript. No rule is type-aware, so a
configured TypeScript project is not required.

## Usage (flat config)

```ts
// eslint.config.mts
import {
    eslintPluginTsFortress,
    type EslintTsFortressRules,
} from 'eslint-plugin-ts-fortress';

export default [
    {
        plugins: { 'ts-fortress': eslintPluginTsFortress },
        rules: {
            'ts-fortress/prefer-non-empty-array': 'error',
        } satisfies Partial<EslintTsFortressRules>,
    },
];
```

## Rules

| Rule                     | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `prefer-non-empty-array` | Replace `minLengthArray(1, …)` with `nonEmptyArray(…)`. |

### `prefer-non-empty-array`

`t.minLengthArray(1, x)` and `t.nonEmptyArray(x)` build the **same type** —
`NonEmptyArray<A>` is defined as `MinLengthArray<1, A>` — so the rewrite is
type-preserving. `nonEmptyArray` states the intent directly and, when no
explicit `typeName` is given, reports the clearer `NonEmptyArray<…>` instead of
`MinLengthArray<1, …>` in validation errors.

```ts
import * as t from 'ts-fortress';

// ❌
const Tags = t.minLengthArray(1, t.string());

// ✅
const Tags = t.nonEmptyArray(t.string());
```

Both the namespace style (`import * as t from 'ts-fortress'`) and named imports
— including aliases — are recognized, and the autofix reuses whatever binding
the file already has, adding `import { nonEmptyArray } from 'ts-fortress';`
only when a named call needs it.

The rule deliberately leaves alone:

- other minimum lengths (`minLengthArray(2, …)` is `MinLengthArray<2, …>`);
- `minLengthTuple(1, …)`, which produces the structural
  `readonly [A, ...A[]]` tuple rather than the branded `NonEmptyArray`;
- calls passing a `defaultValue` option, because `nonEmptyArray` types it as
  `NonEmptyTuple<A>` while `minLengthArray` types it as the branded
  `MinLengthArray<1, A>` — a blind rewrite could stop type-checking. A
  `typeName`-only options object is safe and is rewritten;
- files that already bind the name `nonEmptyArray` to something else.

## License

[Apache-2.0](./LICENSE)
