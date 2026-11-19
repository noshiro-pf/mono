---
'ts-std-forge': patch
'ts-data-forge': patch
---

`hasKey` narrows only where it returns `true`, as the strict standard library's
`Object.hasOwn` now does, where the object's type gains the key, typed as the
type declares it or `unknown`, and only for one literal key that no member of
the object's type declares as required. Its type predicate narrowed both ways,
which was unsound: `false` says only that the object has no own property of that
name, and a type cannot tell an own property from an inherited one, nor rule out
properties it does not name. With `v: Readonly<{ x: number }>` holding
`{ x: 1, y: 2 }`, `hasKey(v, 'y')` typed `v` as `never` where it returned
`true`; with `o: Readonly<{ a?: number }>` holding `{}`, `hasKey(o, 'a')` typed
`o` as `never` where it returned `false`. `HasKeyReturnType<R, K>` is now the
type it narrows to where it returns `true`: each member of `R` with the property
`K` added.

The old narrowing was wrong, so this is released as a fix, in ts-std-forge and
in ts-data-forge, which re-exports `hasKey`, but code that relied on it may stop
compiling:

- Where `hasKey` returns `false`, the object keeps its type. Code that told a
  union of shapes apart with it, as in `hasKey(v, 'a') ? v.a : v.b` with
  `v: Readonly<{ a: number }> | Readonly<{ b: string }>`, does not compile: tell
  such a union apart by a discriminant property, or with a type guard written
  for the union.
- A key that a member of the object's type declares as required, a union of
  keys, a key typed `string` and an object of a generic type narrow nothing
  either way. Code that read `obj[key]` after `hasKey(obj, key)` with a key
  typed `string` compiled because `obj` was typed `never` there, which made the
  value `never` too; narrow the key instead, with `keyIsIn(key, obj)`.
