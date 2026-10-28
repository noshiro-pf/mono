---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

A set or map of a literal union keeps the literal union where its element type
is inferred:

- `union` and `symmetricDifference` of two `ReadonlySet<'a' | 'b'>` are
  `ReadonlySet<'a' | 'b'>`, where they had been `ReadonlySet<string>`.
- `const s: ReadonlySet<'a' | 'b'> = new Set(['a'])`, and the same with
  `new Map(...)` and a `ReadonlyMap`, infer the type arguments from the
  annotation instead of failing with `Set<string>`.
- A `Set<'a' | 'b'>` passed to a parameter `ReadonlySet<T>` infers
  `T = 'a' | 'b'`, where it had been `string`; the same for a `Map` passed to a
  `ReadonlyMap<K, V>`.

The parameter of `has` on `Set`, `ReadonlySet`, `Map`, `ReadonlyMap`,
`WeakSet` and `WeakMap` is `NoInfer<T | (WidenLiteral<T> & {})>`. It still
accepts the widened type, so a `ReadonlySet<'a' | 'b'>` can be queried with a
`string`, but no longer takes part in inference. A method parameter is
bivariant, so where `T` was inferred structurally through `has` — between `Set`
and `ReadonlySet`, which are different interfaces — the widened parameter had
widened `T` to `string`. `NoInfer` was introduced in TypeScript 5.4, so the
bundles for 5.0 to 5.3 are unchanged.

`ReadonlySetLike#has`, the argument type of the ES2025 Set methods (TypeScript
5.5 and later), takes the same parameter. It had been left as `has(value: T)`.
