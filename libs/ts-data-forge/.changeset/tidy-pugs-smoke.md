---
'ts-data-forge': patch
---

`Arr.toSorted` is usable from a function that is itself generic over the array.
Its parameter list was a conditional type — a tuple with an optional comparator
for `readonly number[]` and a required one otherwise — and a generic `Ar` cannot
decide it, so the whole argument list was rejected:

```ts
const sortAscending = <const T extends readonly number[]>(
    xs: T,
): readonly T[number][] => Arr.toSorted(xs, (a, b) => a - b);
// Argument of type '[T, (a: number, b: number) => number]' is not assignable
// to parameter of type 'T extends readonly number[] ? ... : ...'
```

The two cases are now two overloads, so resolution picks one per call. Concrete
callers are unaffected — the optional comparator for numbers, the required one
for everything else, and every reported result type are unchanged.

This is the same class of problem 14.0.1 fixed for `Arr.map`, `Arr.toFilled`
and `Arr.toRangeFilled`, except on the parameter side rather than the return
side.

`Arr.tail`, `Arr.butLast`, `Arr.zip`, `Arr.set` and `Arr.toUpdated` still do not
resolve under a generic array parameter. They report `ConstrainedList.Tail` /
`Zip` / `SetAt`, whose brand branch computes on the input's own bounds, and that
computation expands the whole `SupportedLength` union when the input is a type
parameter. Fixing those needs a change in ts-type-forge, not here; the reason is
recorded in `array-utils-shape-invariants.test.mts` alongside the coverage.
