---
'ts-type-forge': patch
---

`BoolNot`, `BoolAnd`, `BoolOr` and `BoolEq` no longer collapse to `never` when
an operand reaches them through a generic type-alias parameter. `BoolNand`,
`BoolNor` and `BoolNeq` are built from those four, so they are fixed too.

The four operators classified each operand with `TypeEq<A, true>` /
`TypeEq<A, false>` — an **identity** test. When an operand is computed inside a
generic alias:

```ts
type SignOf<N> = [N] extends [Positive] ? 'pos' : /* … */ 'nonpos';
type Le0<S> = S extends 'neg' | 'nonpos' ? true : false;

type BothLe0<X, Y> = BoolAnd<Le0<SignOf<X>>, Le0<SignOf<Y>>>;
```

TypeScript hands back, at `BothLe0<NonPositive, NonPositive>`, a type that is
mutually assignable to `true` but is not _identical_ to it. Both `TypeEq`
probes therefore answered `false` and the operator fell through to its `never`
fallback — `BothLe0<NonPositive, NonPositive>` was `never` rather than `true`,
and a downstream `BoolOr<false, never>` then silently answered `false`. Spelled
out at the use site, with the same operands already resolved, the very same
expression evaluated correctly, which made the discrepancy hard to spot.

Classification is now assignability-based (`[A] extends [L]` in both
directions), which reads such an operand correctly. **The truth tables are
unchanged**, including the degenerate inputs: `boolean`, `never` and `any`
operands still yield `never`, exactly as before.

Types built on these operators — `IsNotAny`, `IsNotUnknown`,
`IsNotFixedLengthList`, `IsUnion`, `HasLengthConstraint` and the
length-constrained array machinery — become correspondingly more accurate where
they were hitting the same fallback. As a side effect, type-checking gets
faster: the identity probes compared two generic function signatures per
operand, and the assignability probes do not.
