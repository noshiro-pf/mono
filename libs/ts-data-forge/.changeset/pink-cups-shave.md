---
'ts-data-forge': minor
---

`Arr.every` used as a type guard now narrows to the element-substituted array
rather than to a bare `readonly S[]`, so a tuple stays a tuple of `S` and a
length-constrained array keeps its brand:

```ts
declare const xs: MinLengthArray<3, string | number>;

if (Arr.every(xs, isString)) {
    // now assignable to MinLengthArray<3, string>; previously it was not
    takesNonEmptyStrings(xs);
}

declare const pair: FixedLengthTuple<2, string | number>;

if (Arr.every(pair, isString)) {
    // now assignable to readonly [string, string]; previously it was not
    takesStringPair(pair);
}
```

The old predicate said `array is readonly S[]`. TypeScript intersected that
with the declared type, so indexed access happened to come out right, but the
narrowed type was not assignable to the same container with `S` elements —
callers had to reach for a type assertion to pass it on.

Brand-carrying arrays select a separate overload returning
`ChangeArrayElement<Ar, S> & Ar`; everything else states the homomorphic
mapping directly, for the same reason as in `Arr.map` — a _generic_ `Ar`
cannot decide `HasLengthConstraint`. Both are intersected with the input, so a
brand intersected with an exact tuple — the shape `Arr.isMinLengthArray` and
`Arr.asMinLengthArray` produce — keeps the brand, the length and the positions
all at once.

The curried form gets the same treatment. Its two cases are overloads of the
_returned_ guard rather than of `Arr.every` itself, so a single
`Arr.every(predicate)` value still accepts branded and unbranded arrays alike.

`Arr.every` with a plain `boolean` predicate, and `Arr.some`, are unchanged.
