---
'ts-type-forge': minor
---

**New: `ConstrainedList`, the `List` operations made aware of the
length-constraint brands.**

`List` decides what it can say about a result from whether the input is a
fixed-length tuple. A length-constrained array is not one — its `length` is
`number` — so `List` falls back to returning the input type unchanged. For the
operations that shorten an array that is not merely imprecise, it is **wrong**:

```ts
type Wrong = List.Take<2, MinLengthArray<5, string>>;
// MinLengthArray<5, string> — a two-element result claiming at least five

type Right = ConstrainedList.Take<2, MinLengthArray<5, string>>;
// FixedLengthArray<2, string>
```

Every member recovers the input's bounds from the brand, applies that
operation's effect on them, and rebuilds the constraint with the most specific
member of the family the result allows:

| type                              | effect on `(min, max)`               |
| :-------------------------------- | :----------------------------------- |
| `ConstrainedList.Reverse<Ar>`     | unchanged                            |
| `ConstrainedList.SetAt<Ar, I, V>` | unchanged, element type widened      |
| `ConstrainedList.Tail<Ar>`        | `(min − 1, max − 1)`                 |
| `ConstrainedList.ButLast<Ar>`     | `(min − 1, max − 1)`                 |
| `ConstrainedList.Take<N, Ar>`     | `(min(N, min), min(N, max))`         |
| `ConstrainedList.TakeLast<N, Ar>` | `(min(N, min), min(N, max))`         |
| `ConstrainedList.Skip<N, Ar>`     | `(min − N, max − N)`                 |
| `ConstrainedList.SkipLast<N, Ar>` | `(min − N, max − N)`                 |
| `ConstrainedList.Concat<A, B>`    | `(minA + minB, maxA + maxB)`         |
| `ConstrainedList.Zip<A, B>`       | `(min(minA, minB), min(maxA, maxB))` |
| `ConstrainedList.Head<Ar, D>`     | the element, `D` only if `min` is 0  |
| `ConstrainedList.Last<Ar>`        | the element                          |
| `ConstrainedList.Partition<N,Ar>` | chunks of `(1, N)`                   |

Subtraction saturates at `0`, and an absent upper bound stays absent (except
under `Take`, which imposes one). For an input with no length-constraint brand
each member delegates to its `List` counterpart, so a plain tuple keeps mapping
exactly as before.

The bounds arithmetic goes through `MakeTuple` rather than stepping a counter,
so each operation costs a handful of instantiations regardless of how large the
bounds are: `MakeTuple` builds a tuple by digit-wise tiling, and the addition,
saturating subtraction and minimum are each a single variadic-tuple match
against it. Adding the family's forty type-level assertions to this package's
own suite left the total instantiation count unchanged within noise
(1,498,757 against a 1,506,545 baseline).

Also exported: `FromBounds<Min, Max, Elm>`, which builds a length-constrained
array from explicit bounds (`never` for `Max` meaning "no upper bound") and
picks `FixedLengthArray` / `MaxLengthArray` / `MinLengthArray` /
`BoundedLengthArray` according to which bounds are present.

**Fix: a brand intersected with an exact tuple now propagates the exact
length.**

`ConstrainedList` and `ChangeArrayElement` read an input's bounds from its
brand, but a value can carry a length-constraint brand _and_ an exact tuple at
once — which is the normal shape a type guard produces, since
`Arr.isMinLengthArray(3, xs)` on a five-tuple narrows it to
`MinLengthArray<3, E> & readonly [a, b, c, d, e]`. The tuple pins the length
where the brand only bounds it, and the tuple was being ignored:

```ts
type Branded = MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5];

ConstrainedList.Tail<Branded>;
// before: MinLengthArray<2, …>       after: FixedLengthArray<4, …>

ChangeArrayElement<Branded, string>;
// before: MinLengthArray<3, string>  after: readonly [string × 5] & brand
```

Both were sound — they claimed less than the truth, never more — so this is a
precision fix rather than a correctness one, and results only ever get
narrower. `MinLengthOf` / `MaxLengthOf` are unchanged: they answer "what does
the brand guarantee", which stays the right question for them.

**The tuple half is now carried through as well**, not just the length it
pins. Each operation rebuilds the exact tuple and runs the plain `List`
operation on it, intersecting the result with the recomputed brand:

```ts
ConstrainedList.Tail<Branded>;
// FixedLengthArray<4, 1 | 2 | 3 | 4 | 5> & readonly [2, 3, 4, 5]

ConstrainedList.Reverse<Branded>;
// MinLengthArray<3, 1 | 2 | 3 | 4 | 5> & readonly [5, 4, 3, 2, 1]

ConstrainedList.Last<Branded>; // 5
```

The rebuild is positional rather than by pattern-matching, because variadic
`infer` does not see through an intersection — which is the same blindness
that makes `List.Tail` of such a type `readonly unknown[]`, and makes
`List.Reverse`, `List.SetAt` and `List.Partition` exceed the
instantiation-depth limit outright. Indexed access _does_ reach through, so
the tuple is rebuilt one index at a time, capped at 32 elements; past the cap
the brand answer stands alone, which claims less rather than more. `List` and
`Tuple` themselves are unchanged — the type tests now pin their behavior on
such an input so the gap stays visible.

Cost of the rebuild across this package's own suite: **+18.5k instantiations,
about 1.2%**.

**Also exported: `NormalizeLengthConstraint<Ar>`.**

The family expands structurally, so a brand intersected with a tuple carries
several conjuncts the tuple already subsumes:

```ts
type Naive = BoundedLengthArray<2, 5, number> & readonly [3, 2, 1];
// readonly number[] & MinLengthTuple<2, number> & <brand> & readonly [3, 2, 1]

type Normal = NormalizeLengthConstraint<Naive>;
// readonly [3, 2, 1] & <brand>
```

The normal form is exactly two conjuncts: the tuple, which says everything
structural there is to say, and the brand, which is the only part the tuple
cannot express. It is the same type, written the shortest way.

This is what lets a `ConstrainedList` answer be compared against applying the
operation to each half separately — the two are the same type, but only their
normalized spellings are the same _shape_:

```ts
type Branded = BoundedLengthArray<2, 5, number> & readonly [1, 2, 3];

NormalizeLengthConstraint<ConstrainedList.Reverse<Branded>>;
// identical to
NormalizeLengthConstraint<
    ConstrainedList.Reverse<BoundedLengthArray<2, 5, number>> &
        List.Reverse<readonly [1, 2, 3]>
>;
```

An input pinning no exact length — a pure brand, or a tuple past the rebuild
cap — is already as short as it gets and comes back unchanged. The equivalence
assumes the brand and the tuple agree, which is automatic for a guard-produced
type; a contradictory intersection written by hand (a brand demanding six
elements over a five-tuple) normalizes to a strictly wider type, and the type
tests pin that.
