---
'ts-type-forge': minor
---

Add `Tuple.MapTo<E, T>`, the named homomorphic tuple mapping.

It replaces the element type of a tuple or array with `E` while keeping its
shape — length, rest and optional positions alike — i.e. the named spelling of
`Readonly<{ [K in keyof T]: E }>`. The counterpart of `ArrayElement`, which
reads the element type out.

`ChangeArrayElement` already covered this, but it is brand-aware, so it answers
with a conditional on `HasLengthConstraint<T>`. A bare type parameter cannot
decide that conditional, and the deferred result is not assignable to the
caller's own `{ [K in keyof T]: E }`, which makes it unusable as an annotation
inside a function that is itself generic over the tuple — exactly where a name
for the shape is most wanted. `Tuple.MapTo` is the plain homomorphic mapping
for that case. Keep using `ChangeArrayElement` whenever the input may carry a
length-constraint brand.
