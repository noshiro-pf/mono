---
'eslint-plugin-ts-type-forge': minor
---

Replace `prefer-non-empty-array` with **`prefer-canonical-length-constrained-tuple`**,
a single rule covering the whole uniform-tuple family:

| spelling                    | readonly target          | mutable target                  |
| :-------------------------- | :----------------------- | :------------------------------ |
| `[V, ...V[]]`               | `NonEmptyTuple<V>`       | `MutableNonEmptyTuple<V>`       |
| `[V, …×N, ...V[]]` (N >= 2) | `MinLengthTuple<N, V>`   | `MutableMinLengthTuple<N, V>`   |
| `[V, …×N]` (N >= 2)         | `FixedLengthTuple<N, V>` | `MutableFixedLengthTuple<N, V>` |

`N` is bounded by the new `maxLength` option (default 10).

**BREAKING CHANGE**: `prefer-non-empty-array` is removed; enable
`prefer-canonical-length-constrained-tuple` instead. Beyond the rename, its
target changed from `NonEmptyArray<V>` to `NonEmptyTuple<V>`:
`NonEmptyArray<V>` is `MinLengthTuple<1, V>` intersected with a brand — a strict
subtype of `readonly [V, ...V[]]` — so the previous autofix _narrowed_ the
declared type and could break assignments from plain array literals. The
structural `NonEmptyTuple<V>` is exactly equal to the spelled-out tuple, making
every fix a pure rename.
