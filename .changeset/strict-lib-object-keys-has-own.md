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

`Object.keys` and `Object.hasOwn` accept any object, as `Object.entries` and
`Object.values` already did. They took only a value assignable to
`UnknownRecord`, such as an object literal's, so a value of an interface or a
class that declares no string index signature, an array, a `Map`, or a value of
type `object` (what `typeof u === 'object' && u !== null` narrows `unknown` to)
did not compile. A primitive, as in `Object.keys(1)`, is still an error.

`Object.keys` is one signature for every object: a type `UnknownRecord` accepts
still gets its keys (`Object.keys` of `{ x: 1, y: 2 }` is an array of
`'x' | 'y' | (string & {})`), and any other object gets `string`, in an array
that is readonly in the branded flavor. As one signature, it keeps the keys
where it is passed rather than called, as in `records.map(Object.keys)`. Its
result is `([R] extends [UnknownRecord] ? <keys of R> : string)[]` (readonly in
the branded flavor), so in a generic function, where `R` is a type parameter
such as `T extends UnknownRecord`, TypeScript leaves that condition unresolved
until `T` is known: the elements are still strings, but no longer the keys of
`T`.
Annotate the result `readonly string[]` there.

`Object.hasOwn` narrows only where it returns `true`, where the object's type
gains the key, typed as the type declares it or `unknown`, and only for one
literal key that no member of the object's type declares as required. Its type
predicate narrowed both ways, which was unsound: `false` says only that the
object has no own property of that name, and a type cannot tell an own property
from an inherited one, nor rule out properties it does not name. With
`v: { x: number }` holding `{ x: 1, y: 2 }`, `Object.hasOwn(v, 'y')` typed `v`
as `never` where it returned `true`; with `o: { a?: number }` holding `{}`,
`Object.hasOwn(o, 'a')` typed `o` as `never` where it returned `false`, and so
did `Object.hasOwn(v, 'x')` with `v: { x: number }` holding a class instance
whose `x` is a getter.

The old narrowing was wrong, so this is released as a fix, but code that relied
on it may stop compiling:

- Where `Object.hasOwn` returns `false`, the object keeps its type. Code that
  told a union of shapes apart with it, as in
  `Object.hasOwn(v, 'a') ? v.a : v.b` with `v: { a: number } | { b: string }`,
  does not compile: tell such a union apart by a discriminant property, or with
  a type guard written for the union.
- A key that a member of the object's type declares as required, a union of
  keys, a key typed `string` and an object of a generic type narrow nothing
  either way. Code that read `obj[key]` after `Object.hasOwn(obj, key)` with a
  key typed `string` compiled because `obj` was typed `never` there, which made
  the value `never` too; narrow the key instead, with a check against the
  object's own keys, such as ts-std-forge's `keyIsIn(key, obj)` for an object
  typed as a record.
