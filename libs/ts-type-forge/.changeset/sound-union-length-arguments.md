---
'ts-type-forge': patch
---

**Fixed: a union length or index argument produced a result no call can
return.** `Tuple.SetAt`, `Tuple.Take`, `Tuple.TakeLast`, `Tuple.Skip`,
`Tuple.SkipLast` and `Tuple.Partition` — and everything layered on them,
`List.*` and `ConstrainedList.*` — each assumed their numeric argument named
exactly one position or length. A union names several, of which a call picks
one, and the old answers described neither outcome:

```ts
type A = List.SetAt<0 | 2, 'x', readonly [1, 2, 3]>;
// before: readonly ['x', 2, 'x'] — satisfied by neither ['x', 2, 3] nor [1, 2, 'x']
// after:  readonly [1 | 'x', 2, 3 | 'x']

type B = List.Take<1 | 2, readonly [1, 2, 3]>;
// before: readonly [1] — the equally possible [1, 2] does not satisfy it
// after:  readonly (1 | 2 | 3)[]
```

This was reachable from ordinary code: indexing a tuple by anything other than
a literal gives exactly such a union.

`number` was affected the same way, and worse, because it marks _every_
position or length as a candidate: `SetAt<number, 'x', [1, 2, 3]>` replaced all
three positions, and `Take<number, T>` matched at length zero and answered
`readonly []`.

**Nothing distributes over the argument.** Distribution would be exact — a
union answer, one member per candidate — but it multiplies the result by the
size of the union, and these are the types most likely to be handed a wide one:
an index union is simply what indexing a tuple by a non-literal produces, and
`ConstrainedList` bounds its length argument by `SupportedLength`, which is
`0..2048`. So each of them answers, for anything but a single numeric literal,
the widest result every possible call satisfies — a union of literals behaves
exactly as `number` does:

- the counting members answer an unsized `readonly Elm[]` (`Partition`, an
  unsized array of unsized chunks), there being no one tuple to name when the
  candidates differ in length;
- `SetAt` widens each candidate position to `T[I] | V` **in place**. It can keep
  the tuple, because its result has the same length whichever index is chosen —
  and indexed access into `readonly [1 | 'x', 2, 3 | 'x']` answers exactly what
  the distributed `readonly ['x', 2, 3] | readonly [1, 2, 'x']` would.

A single numeric literal — by far the common case — keeps exactly the result it
had before, in every one of these types.

**`ConstrainedList`'s counting members follow the same rule**, which also
settles a pre-existing wrinkle: each of them uses `N` in two independent places,
the bound arithmetic and the structural rebuild, and both distributed over a
union on their own, producing the cross product of the two:

```ts
type C = ConstrainedList.Take<1 | 2, MinLengthArray<3, number>>;
// before: FixedLengthArray<1, number>
//       | BoundedLengthArray<2, 1, number>   <- min above max, uninhabited
//       | BoundedLengthArray<1, 2, number>
//       | FixedLengthArray<2, number>
// after:  readonly number[]
```

Those stray members were uninhabited rather than wrong, so that union was sound
already — it collapses to `BoundedLengthArray<1, 2, number>` — but it grew as
the square of the union. Dropping the brand loses a bound the caller might have
wanted; recovering it would mean folding min and max across the union, which is
the cost this avoids.

`MakeTuple` needed no change: it walks the decimal digits of `` `${N}` ``, and
that walk already distributes over a union on its own.

**`Partition` now rejects a chunk size of `0` instead of not terminating.**
`PartitionImpl` closes the current chunk whenever it reaches `N` elements, so
at `N = 0` it closed an empty chunk without ever consuming from the input and
recursed until the instantiation limit — `Tuple.Partition<0, [1, 2]>` was
`TS2589: Type instantiation is excessively deep and possibly infinite` rather
than a type. It now answers `never`, there being no way to split anything into
chunks of nothing. `ConstrainedList.Partition` carries its own guard because on
a brand-only input there is no exact tuple to rebuild, so `Tuple.Partition`'s
`never` would not reach it.

Cost: **+6.6k instantiations, about 0.4%** (1,680,525 against a 1,673,973
baseline), new tests included.
