---
'ts-data-forge': major
'eslint-plugin-ts-data-forge': minor
---

**`Arr.isEmpty` and `Arr.isNonEmpty` now narrow to the branded length-constrained
array types**, matching the rest of the `Arr` length-guard family.

| guard                | before             | after                         |
| :------------------- | :----------------- | :---------------------------- |
| `Arr.isEmpty(xs)`    | `readonly []`      | `FixedLengthArray<0, E> & Xs` |
| `Arr.isNonEmpty(xs)` | `NonEmptyArray<E>` | `MinLengthArray<1, E> & Xs`   |

`isEmpty` was missing the brand entirely, so it was not equivalent to
`Arr.isFixedLengthArray(xs, 0)`; `isNonEmpty` had the brand but dropped the input
type instead of intersecting with it the way `Arr.isMinLengthArray` does. Both
now behave exactly like their `is*LengthArray` counterparts.

BREAKING CHANGE: the narrowed types are strictly narrower than before. Code that
reads the narrowed value keeps compiling, but an explicit annotation such as
`const empty: readonly [] = xs` after the guard, or passing the narrowed value
where an unbranded array literal is expected, may now need the unbranded type
spelled out.

`prefer-canonical-length-guard` follows the new semantics: `isFixedLengthArray(xs, 0)`
and `isMinLengthArray(xs, 1)` are now the _type-identical_ rewrites, and the
structural `*Tuple` guards (`isFixedLengthTuple(xs, 0)`, `isMaxLengthTuple(xs, 0)`,
`isBoundedLengthTuple(xs, 0, 0)`, `isMinLengthTuple(xs, 1)`) are rewritten too —
those strengthen the narrowed type by adding the brand.

`prefer-canonical-length-guard` additionally absorbs the five `xs.length <op> n`
comparison rules — `prefer-arr-is-non-empty`, `prefer-arr-is-min-length-array`,
`prefer-arr-is-max-length-array`, `prefer-arr-is-bounded-length-array` and
`prefer-arr-is-fixed-length-array` — so one rule now covers both
comparison → guard and guard → guard normalization.

BREAKING CHANGE: those five rule names are removed from the plugin; enable
`ts-data-forge/prefer-canonical-length-guard` instead. Their behavior is
unchanged — the rule reuses their implementations rather than reimplementing
them.
