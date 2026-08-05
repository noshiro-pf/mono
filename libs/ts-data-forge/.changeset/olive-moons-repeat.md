---
'ts-data-forge': patch
---

`Arr.map`, `Arr.toFilled` and `Arr.toRangeFilled` again report the plain
homomorphic mapping (`{ [K in keyof Ar]: B }`) for an array or tuple that
carries no length brand, so transforming a tuple into a same-length tuple
works inside a function that is itself generic over the tuple:

```ts
const mapValues = <const T extends readonly Readonly<{ v: unknown }>[]>(
    boxes: T,
): Readonly<{ [K in keyof T]: unknown }> => Arr.map(boxes, (b) => b.v);
```

Since v14 the return type was a conditional branching on
`HasLengthConstraint<Ar>`, which a _generic_ `Ar` cannot decide. The
conditional stayed deferred and its branded branch made the result
unassignable to the caller's own mapping, so callers had to reach for a type
assertion. Concrete tuples were unaffected and keep the same result as before.

Brand-carrying arrays are unaffected too: they select a separate overload that
still returns `ChangeArrayElement<Ar, …>`, so `Arr.map` on a
`MinLengthArray<2, number>` still yields a `MinLengthArray<2, …>`.

`Arr.toSorted`, `Arr.toSortedBy`, `Arr.toReversed`, `Arr.toUpdated`,
`Arr.tail`, `Arr.butLast` and `Arr.zip` still do not resolve under a generic
array parameter and are unchanged here.
