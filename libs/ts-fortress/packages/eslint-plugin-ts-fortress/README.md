# eslint-plugin-ts-fortress

ESLint rules that steer schema definitions toward
[`ts-fortress`](https://www.npmjs.com/package/ts-fortress) idioms. Every rule is
auto-fixable, and every rewrite is **type-preserving**.

## Installation

```sh
npm install --save-dev eslint-plugin-ts-fortress
```

Requires ESLint 9+ (flat config) and TypeScript. No rule is type-aware, so a
configured TypeScript project is not required.

## Usage (flat config)

The plugin ships a `recommended` config preset that registers the plugin and
turns on **every** rule at `error`:

```ts
// eslint.config.mts
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';

export default [eslintPluginTsFortress.configs.recommended];
```

Since the preset is a plain flat-config object, individual rules can be
adjusted by a later config entry:

```ts
// eslint.config.mts
import {
    eslintPluginTsFortress,
    type EslintTsFortressRules,
} from 'eslint-plugin-ts-fortress';

export default [
    eslintPluginTsFortress.configs.recommended,
    {
        files: ['src/legacy/**'],
        rules: {
            'ts-fortress/prefer-canonical-length-constrained-type': 'off',
        } satisfies Partial<EslintTsFortressRules>,
    },
];
```

Or register the plugin yourself and pick the rules one by one:

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
            'ts-fortress/prefer-canonical-length-constrained-type': 'error',
        } satisfies Partial<EslintTsFortressRules>,
    },
];
```

## Rules

| Rule                                       | Description                                                                                   |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `prefer-canonical-length-constrained-type` | Normalize a length-constrained array combinator with degenerate bounds to its canonical form. |

### `prefer-canonical-length-constrained-type`

Several of ts-fortress's array combinators build the very same type once their
length arguments hit a degenerate value. The rule rewrites each of those to the
combinator that names the constraint directly:

| ❌ written as                 | ✅ canonical form        | why they are the same type                                         |
| :---------------------------- | :----------------------- | :----------------------------------------------------------------- |
| `minLengthArray(1, x)`        | `nonEmptyArray(x)`       | `NonEmptyArray<A>` is defined as `MinLengthArray<1, A>`            |
| `minLengthTuple(0, x)`        | `array(x)`               | `MinLengthTuple<0, A>` is `readonly A[]` — no constraint at all    |
| `maxLengthTuple(0, x)`        | `fixedLengthTuple(0, x)` | both are `readonly []`                                             |
| `boundedLengthTuple(n, n, x)` | `fixedLengthTuple(n, x)` | the length union collapses to its single member                    |
| `boundedLengthTuple(0, n, x)` | `maxLengthTuple(n, x)`   | `MaxLengthTuple<N, A>` is defined as `BoundedLengthTuple<0, N, A>` |

```ts
import * as t from 'ts-fortress';

// ❌
const Tags = t.minLengthArray(1, t.string());
const Rgb = t.boundedLengthTuple(3, 3, t.number());
const Page = t.boundedLengthTuple(0, 20, t.string());

// ✅
const Tags = t.nonEmptyArray(t.string());
const Rgb = t.fixedLengthTuple(3, t.number());
const Page = t.maxLengthTuple(20, t.string());
```

Each rewrite keeps the accepted values, the `defaultValue`, and the options
object exactly as they were. The only observable change is the default
`typeName` — and the `details.kind` of the length error derived from it — which
becomes the one that names the constraint actually being checked.

#### Why the branded `*Array` family is left alone

`boundedLengthArray(0, n, x)` and `boundedLengthArray(n, n, x)` look like the
same degenerate cases, but their types are branded rather than structural, and
the analogous rewrites would silently change them:

- `BoundedLengthArray<Min, Max, A>` is
  `MaxLengthArray<Max, A> & MinLengthArray<Min, A>`, so rewriting
  `boundedLengthArray(0, n, x)` to `maxLengthArray(n, x)` **drops** the
  `MinLengthArray<0, A>` brand — a widening.
- `FixedLengthArray<N, A>` additionally intersects the exact tuple
  `FixedLengthTuple<N, A>` for `N <= 10`, so rewriting
  `boundedLengthArray(n, n, x)` to `fixedLengthArray(n, x)` **adds** a
  constraint — a narrowing.

Neither is a pure rename, so the rule does not report them.

#### Bounds above the structural cap

The `*Tuple` combinators only encode lengths up to `10` (ts-type-forge's
`StructuralPrefixLength`); past that they fall back to an overload that drops
the constraint from the result type. The rule therefore only fires when the
bound it carries over to the other combinator is a literal within `0..10`.

#### Imports

Both the namespace style (`import * as t from 'ts-fortress'`) and named imports
— including aliases — are recognized, and the autofix reuses whatever binding
the file already has, adding `import { … } from 'ts-fortress';` only when a
named call needs one.

#### The rule deliberately leaves alone

- non-degenerate bounds (`minLengthArray(2, …)`, `boundedLengthTuple(1, 3, …)`);
- computed bounds and calls with explicit type arguments, since the literal is
  what makes the two forms equivalent;
- `minLengthArray(1, …)` calls passing a `defaultValue`, because
  `nonEmptyArray` types that option as `NonEmptyTuple<A>` while
  `minLengthArray` types it as the branded `MinLengthArray<1, A>` — a blind
  rewrite could stop type-checking. A `typeName`-only options object is safe
  and is rewritten. (The other rewrites type `defaultValue` identically, so
  they keep it.)
- calls where the target name is already bound to something else at the call
  site.

## License

[Apache-2.0](./LICENSE)
