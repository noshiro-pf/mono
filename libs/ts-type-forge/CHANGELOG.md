## [7.2.1](https://github.com/noshiro-pf/ts-type-forge/compare/v7.2.0...v7.2.1) (2026-07-21)

## 9.2.1

### Patch Changes

- 3d6bca7: Fix the links in the README. They were relative, and npm rewrites a relative
  link against the repository root without regard for `repository.directory`, so
  publishing from the monorepo would have pointed them at paths that do not
  exist — `synstate`'s logo among them. They are absolute now. The links that
  still named one of the repositories this package was merged from now name
  `mono`, and a handful that had gone stale independently (a file that moved, one
  that was renamed, three documents that became pages on the docs site) point
  where those things actually are.

## 9.2.0

### Minor Changes

- d0a0a3d: Add `Tuple.MapTo<E, T>`, the named homomorphic tuple mapping.

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

### Patch Changes

- ca73a82: Back every JSDoc `@example` with a type-checked sample file.

    95 examples across 25 modules were written as bare JSDoc lines rather than
    ` ```ts ` blocks sourced from `samples/src`, so they were never compiled. Six
    had drifted:

    - `RecordPaths` / `RecordPathsWithIndex` / `RecordLeafPaths` /
      `RecordLeafPathsWithIndex` / `RecordPathAndValueTypeTuple` documented
      themselves under names that do not exist (`Paths`, `PathsWithIndex`,
      `LeafPaths`, `LeafPathsWithIndex`, `KeyPathAndValueTypeAtPathTuple`).
    - `List.Partition` advertised `List.Partition<3, readonly number[]>`, which
      does not compile: partitioning a non-fixed-length array exceeds TypeScript's
      instantiation depth (TS2589). The example now shows the tuple cases that do
      work.

    `doc:embed:jsdoc` now keys its coverage check off the `@example` tag rather
    than the ` ```ts ` fence, so an unfenced — and therefore unchecked — example
    fails the build instead of passing unnoticed, both in an unregistered module
    and in a registered one.

## 9.1.3

### Patch Changes

- f3ec911: `BoolNot`, `BoolAnd`, `BoolOr` and `BoolEq` no longer collapse to `never` when
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

## 9.1.2

### Patch Changes

- 9619152: `packages/ts-type-forge/src` no longer references the standard library's
  `Exclude`, `Extract`, `Omit`, `Pick` or `Record` anywhere — every internal use
  now goes through this package's own `StrictExclude` / `RelaxedExclude`,
  `StrictExtract` / `RelaxedExtract`, `StrictOmit` / `RelaxedOmit`,
  `StrictPick` / `RelaxedPick` and `ReadonlyRecord` / `MutableRecord`, and an
  ESLint rule (`@typescript-eslint/no-restricted-types`, configured in the
  package's own flat config) keeps it that way.

    **No type changes meaning.** `StrictPick<T, K>` and `StrictOmit<T, K>` have
    exactly the bodies `Pick<T, K>` and `Omit<T, K>` have; `ReadonlyRecord<K, V>`
    differs from `Record<K, V>` only by a `readonly` modifier, which assignability
    does not consider, so the `T extends ReadonlyRecord<string, any>` guards select
    the same branch the `Record` ones did; and the two brand-key helpers below
    subtract exactly the members they subtracted before. `DeepReadonly`,
    `DeepPartial`, `DeepRequired`, `DeepMutable`, `DeepPick`, `DeepOmit`,
    `PartiallyPartial`, `RequiredKeys`, `HasLengthConstraint`,
    `LengthConstraintBrandOf`, `GetBrandKeysPart`, `MonthEnum`, `DateEnum` and
    everything downstream resolve identically.

    What it fixes is compilation under a **standard library that narrows
    `Exclude`** to `Exclude<T, U extends T>` (as `strict-typescript-lib` does).
    There, subtracting a literal key union from a `keyof T` still deferred on a
    type parameter is TS2344 — the checker cannot prove the union is a subset of a
    `keyof T` it has not resolved:

    ```diff
    -type ExtraKeysOf<T extends readonly unknown[]> =
    -  Exclude<keyof T, keyof unknown[] | keyof (readonly unknown[]) | `${number}`>;
    +type ExtraKeysOf<T extends readonly unknown[]> =
    +  RelaxedExclude<keyof T, keyof unknown[] | keyof (readonly unknown[]) | `${number}`>;
    ```

    `RelaxedExclude` carries no constraint on its second argument by definition, so
    the subtrahend needs no proof and no `Extract<keyof T, …>` wrapper. Because the
    same is now true of every other subtraction, pick and record in the package,
    `ts-type-forge` is consumable under such a lib without patching, and cannot
    regress into depending on those signatures again.

## 9.1.1

### Patch Changes

- e83818f: **Fixed: a union length or index argument produced a result no call can
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

## 9.1.0

### Minor Changes

- 1132737: **Fix: `DeepReadonly` / `DeepMutable` / `DeepPartial` / `DeepRequired` no longer
  turn a length-constrained array into a non-array object.**

    All four transforms end in a homomorphic mapped type over `keyof T`. A
    length-constrained array is an intersection of a tuple and a brand object, which
    TypeScript does not treat as an array type, so that mapping walked `length`,
    every `Array.prototype` method and the brand keys and produced an object with
    those as ordinary properties:

    ```ts
    type Broken = DeepReadonly<MinLengthArray<3, { a: number[] }>>;
    // { readonly length: number;
    //   readonly map: <U>(cb: (v: { a: number[] }, …) => U, …) => U[];
    //   readonly concat: …; readonly filter: …; … }
    ```

    The result was not an array, could not be indexed or iterated, and the damage
    nested — `DeepReadonly<{ xs: MinLengthArray<2, number> }>` corrupted `xs` the
    same way. This is the same failure `ChangeArrayElement` was introduced to avoid,
    reached through a different door; it needs no tuple intersection and reproduces
    on a bare `MinLengthArray`.

    Each transform now recognizes an array carrying keys beyond the array members
    and rebuilds one, carrying the brand across:

    ```ts
    type Fixed = DeepReadonly<MinLengthArray<3, { a: number[] }>>;
    // readonly { readonly a: readonly number[] }[] & <brand>

    MinLengthOf<Fixed>; // 3
    HasLengthConstraint<Fixed>; // true
    ```

    A plain array or tuple is untouched — it still maps element-wise, so
    `DeepReadonly<readonly [{ a: number[] }, { b: string[] }]>` keeps its two
    positions distinct exactly as before.

    The rebuild deliberately stops short of restoring the structural
    minimum-length prefix, so the result is strictly **wider** than the matching
    family member: `MinLengthArray<3, DeepReadonly<E>>` is assignable to it, not the
    other way round, and indexed access needs a guard again. Restoring the prefix
    means recovering the bounds, which costs one instantiation per unit of the
    bound — affordable for a single array, but not for every array an already deeply
    recursive transform reaches. Paying it was enough to push this package's own
    `DeepReadonly<ExecOptions>` assertion over the instantiation-depth limit and
    surface TS2589 in unrelated modules. Call `ChangeArrayElement` directly when one
    array needs its exact shape back.

    `DeepMutable` is the one member that cannot fully deliver on its name here. The
    family's structural part is a readonly tuple, so a mutable array carrying a
    length-constraint brand is not expressible with these types at all; it
    deep-mutates the element type and leaves the array itself readonly and branded.

    Cost across this package's own suite: **+80.8k instantiations, about 5.1%**
    (1,658,120 against a 1,577,296 baseline) — the price of testing every array for
    extra keys.

    **Fix: `HasLengthConstraint` and `ChangeArrayElement` no longer treat a mutable
    array as brand-carrying.**

    Both read the brand by subtracting the array's own keys from `keyof Ar`, but
    subtracted only `keyof (readonly unknown[])`. A mutable array also carries
    `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` and
    `copyWithin`, none of which the readonly key set mentions, so all nine survived
    the subtraction and were read as brand keys:

    ```ts
    HasLengthConstraint<number[]>; // was true, now false
    ChangeArrayElement<number[], string>;
    // was: readonly string[] & Pick<number[], 'push' | 'pop' | 'splice' | …>
    // now: readonly string[]
    ```

    Every caller so far passed a readonly array, which is why this stayed latent;
    the deep transforms above are the first to hit it, since a mutable array is the
    ordinary input to `DeepReadonly`. Both key sets are subtracted now.

## 9.0.0

### Major Changes

- 0e7e904: **`MakeTuple` and `SetAt` now take their length / index first, like the rest of
  the library.**

    Every other length-parameterized array or tuple type here puts the length
    first — `MinLengthArray<MinLength, Elm>`, `BoundedLengthTuple<Min, Max, Elm>`,
    `FixedLengthTuple<N, Elm>` — and within `List` / `Tuple` the count-taking
    operations do too: `Take<N, T>`, `Skip<N, T>`, `TakeLast<N, T>`,
    `SkipLast<N, T>`, `Partition<N, T>`. Two members were out of step:

    | type                              | before        | after                             |
    | :-------------------------------- | :------------ | :-------------------------------- |
    | `MakeTuple<Elm, N>`               | element first | `MakeTuple<N, Elm>`               |
    | `List.SetAt<T, I, V>`             | array first   | `List.SetAt<I, V, T>`             |
    | `Tuple.SetAt<T, I, V>`            | array first   | `Tuple.SetAt<I, V, T>`            |
    | `ConstrainedList.SetAt<Ar, I, V>` | array first   | `ConstrainedList.SetAt<I, V, Ar>` |

    `MakeTuple` was the more visible of the two, because the swap showed up in the
    library's own source: `FixedLengthTuple<N, Elm> = MakeTuple<Elm, N>`. It now
    reads `MakeTuple<N, Elm>`.

    `SetAt` was the only count-taking `List` / `Tuple` operation that led with the
    array, so `List.SetAt<[1, 2, 3], 1, 'x'>` sat next to `List.Take<2, [1, 2, 3]>`
    with the array on the opposite side. It now reads `List.SetAt<1, 'x', [1, 2, 3]>`.

    BREAKING CHANGE: `MakeTuple`, `List.SetAt`, `Tuple.SetAt` and
    `ConstrainedList.SetAt` reorder their type parameters. Every use site must
    swap its arguments — `MakeTuple<string, 3>` becomes `MakeTuple<3, string>`, and
    `List.SetAt<T, I, V>` becomes `List.SetAt<I, V, T>`. These are types, so there
    is no inference to fall back on: the compiler reports each site.

    `List.Head<T, D>` is deliberately unchanged — `D` is a fallback rather than a
    count, and it is defaulted, so leading with it would make the common
    one-argument form impossible to write.

### Minor Changes

- 51b56e9: **New: `ConstrainedList`, the `List` operations made aware of the
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

## 8.1.0

### Minor Changes

- 296790b: **New: the bounds of a length-constrained array type can now be read back, and
  its element type can be replaced while keeping the constraint.**

    The `*LengthArray` family encodes its bounds in a brand shaped for _subtyping_
    rather than for retrieval — `MinLengthTuple<MinLength, 0>` and
    `UintRangeInclusive<0, MaxLength>` — so a consumer had no way to get the numbers
    out, and no way to build "the same constraint with a different element type".

    | type                          | purpose                                                                  |
    | :---------------------------- | :----------------------------------------------------------------------- |
    | `MinLengthOf<Ar>`             | the minimum length the brand guarantees (`0` when it has no lower bound) |
    | `MaxLengthOf<Ar>`             | the maximum length the brand allows (`never` when it has no upper bound) |
    | `HasLengthConstraint<Ar>`     | whether `Ar` carries a length-constraint brand at all                    |
    | `LengthConstraintBrandOf<Ar>` | the brand itself, as an object type (`{}` for a plain array or tuple)    |
    | `ChangeArrayElement<Ar, Elm>` | `Ar` with its element type replaced by `Elm`, constraint kept            |

    ```ts
    type A = MinLengthOf<BoundedLengthArray<2, 5, string>>; // 2
    type B = MaxLengthOf<BoundedLengthArray<2, 5, string>>; // 5

    type C = ChangeArrayElement<MinLengthArray<3, number>, string>;
    // MinLengthArray<3, string>
    ```

    Both bounds are recovered from the brand by counting it back, so nothing extra
    is instantiated: `MinLengthOf` peels the encoded tuple's fixed prefix, and
    `MaxLengthOf` walks up from `0` testing membership of the encoded range, which
    it leaves intact (rebuilding a smaller union with `Exclude` at every step would
    make the walk quadratic in the bound). Both are one cheap step per unit of the
    bound, which keeps them well inside TypeScript's instantiation-depth limit for
    realistic bounds but makes them unsuitable for bounds in the thousands.

    `ChangeArrayElement` exists because the obvious homomorphic mapped type cannot
    do the job: a length-constrained array is an intersection of a tuple and the
    brand object, which TypeScript does not treat as an array type, so
    `Readonly<{ [K in keyof Ar]: Elm }>` maps `length`, the array methods and the
    brand keys to `Elm` as well and yields a non-array object. For a plain array or
    tuple `ChangeArrayElement` _is_ that homomorphic mapping, so tuples keep mapping
    element-wise and plain arrays stay plain arrays.

## 8.0.0

### Major Changes

- 9d48fa8: Add **`IntRange<Start, End>`** and **`IntRangeInclusive<MinValue, MaxValue>`**
  to `type-level-integer/`, the signed counterparts of `UintRange` and
  `UintRangeInclusive`: unions of integer literals that also accept negative
  bounds.

    ```ts
    type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
    type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
    type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
    type R4 = IntRange<3, -3>; // never

    type RI1 = IntRangeInclusive<1, 5>; // 1 | 2 | 3 | 4 | 5
    type RI2 = IntRangeInclusive<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2 | 3
    type RI3 = IntRangeInclusive<-5, -1>; // -5 | -4 | -3 | -2 | -1
    type RI4 = IntRangeInclusive<3, -3>; // never
    ```

    `IntRange` is ported from `ts-fortress`, which now re-exports it from here
    instead of declaring its own copy.

    Also add **`Uint11`** (`0` to `2047`) and **`Int11`** (`-1024` to `1023`) to
    `constants/`, extending the existing `Uint8` / `Uint9` / `Uint10` and `Int8` /
    `Int9` / `Int10` family.

    **BREAKING CHANGE**: the whole integer-range family now constrains its bounds,
    matching how `Max` / `Min` already constrain theirs to `Uint10`:

    - `UintRange<Start, End>`: `extends number` / `extends number` →
      `extends Uint11` / `extends Uint11 | 2048`
    - `UintRangeInclusive<MinValue, MaxValue>`: `extends number` /
      `extends number` → `extends Uint11` / `extends Uint11`
    - `IntRange<Start, End>` (new): `extends Int11` / `extends Int11 | 1024`
    - `IntRangeInclusive<MinValue, MaxValue>` (new): `extends Int11` /
      `extends Int11`

    The exclusive-end variants accept one value above the cap (`2048` / `1024`) so
    that the full `Uint11` / `Int11` union stays expressible. A bound the union
    cannot represent — a non-integer, a negative `Uint*` bound, a non-literal
    `number`, or anything past the cap — is now a constraint error instead of
    silently resolving to `never`.

    Every range that already fit those bounds is unaffected. For a `0`-based range
    beyond the `Uint11` cap, use `IndexInclusive<N>` directly:
    `UintRangeInclusive<0, N>` and `IndexInclusive<N>` are the same type. The
    library's own `SupportedLength` (`0 | ... | 2048`, whose inclusive `2048` is one
    past `Uint11`) is now spelled that way.

### Patch Changes

- 94640c0: Define the negated condition types in terms of their positive counterparts
  instead of re-spelling the underlying trick, and `IsNever` in terms of
  `TypeExtends`:

    | type                      | before                                      | after                           |
    | :------------------------ | :------------------------------------------ | :------------------------------ |
    | `IsNotAny<T>`             | `0 extends 1 & T ? false : true`            | `BoolNot<IsAny<T>>`             |
    | `IsNotUnknown<T>`         | `IsUnknown<T> extends true ? false : true`  | `BoolNot<IsUnknown<T>>`         |
    | `IsNotFixedLengthList<T>` | `number extends T['length'] ? true : false` | `BoolNot<IsFixedLengthList<T>>` |
    | `IsNever<T>`              | `[T] extends [never] ? true : false`        | `TypeExtends<T, never>`         |

    Each `IsNot*` previously duplicated the detection logic of its positive
    counterpart, so the two could drift; they are now derived from it, which is
    also what their documentation already claimed. `IsNever` was character-for-
    character the definition of `TypeExtends<T, never>`.

    Behavior is unchanged — the existing type tests for all four cover `any`,
    `never`, `unknown`, unions, tuples and arrays.

### Performance Improvements

- collapse length-constrained brands to base type on union length parameter ([#428](https://github.com/noshiro-pf/ts-type-forge/issues/428)) ([f34256e](https://github.com/noshiro-pf/ts-type-forge/commit/f34256ed3d74edaedb1dc662e1f69e7388d5de60))

# [7.2.0](https://github.com/noshiro-pf/ts-type-forge/compare/v7.1.0...v7.2.0) (2026-07-21)

### Features

- Add NonPositiveInt16, NonPositiveInt32 and WithSmallInt variants; ([#427](https://github.com/noshiro-pf/ts-type-forge/issues/427)) ([6a3024b](https://github.com/noshiro-pf/ts-type-forge/commit/6a3024bfc5a1b6ec1ca09fb2e7878e0d8ae36321))

# [7.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v7.0.0...v7.1.0) (2026-07-20)

### Features

- add IsAny/IsUnknown, fix general-array tuple ops, hide internal… ([#425](https://github.com/noshiro-pf/ts-type-forge/issues/425)) ([5d91fe2](https://github.com/noshiro-pf/ts-type-forge/commit/5d91fe2c7faf2784caacb9e93628bcdc540fb90b))

# [7.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v6.1.0...v7.0.0) (2026-07-18)

### Features

- Add `Mutable{Max,Bounded,Fixed}LengthArray`, completing the mutable branded counterparts of the readonly length-constrained array family so every readonly variant has a matching mutable one ([#417](https://github.com/noshiro-pf/ts-type-forge/issues/417)).

### BREAKING CHANGES

- `NonEmptyArray` / `MutableNonEmptyArray` are now brand-based (`MinLengthArray<1>` / `MutableMinLengthArray<1>`); a plain array literal is no longer directly assignable to them. Use `NonEmptyTuple` / `MutableNonEmptyTuple` for the previous structural types.

# [6.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v6.0.0...v6.1.0) (2026-07-18)

### Features

- add Float16 type ([#416](https://github.com/noshiro-pf/ts-type-forge/issues/416)) ([d7c4634](https://github.com/noshiro-pf/ts-type-forge/commit/d7c4634bbb1f2ea0658e34369c91ec284bb41e49))

# [6.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v5.0.0...v6.0.0) (2026-07-17)

### Features

- Add brand-based length-constrained array types (`MaxLengthArray` / `MinLengthArray` / `BoundedLengthArray` / `FixedLengthArray`), with a structural tuple prefix for small lengths ([#415](https://github.com/noshiro-pf/ts-type-forge/issues/415)).
- Cap the length parameters of the branded array/string families at a shared `SupportedLength` (`0..2048`), and export the shared boundaries `SupportedLengthCap`, `SupportedLength`, `StructuralPrefixCap`, and `StructuralPrefixLength` for downstream reuse.

### BREAKING CHANGES

- Rename the structural tuple family `ArrayOfLength` / `ArrayAtLeastLen` / `ArrayAtMostLen` / `ArrayBoundedLen` (and their `Mutable*` variants) to `FixedLengthTuple` / `MinLengthTuple` / `MaxLengthTuple` / `BoundedLengthTuple` (and `Mutable*`); the old names are no longer exported.
- The length parameters of the branded string types (`MaxLengthString` etc.) are now constrained to `SupportedLength` (`0..2048`); larger literals and non-literal `number` are rejected. `SupportedArrayLength` is renamed to `SupportedLength`.

# [5.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v4.0.0...v5.0.0) (2026-07-09)

- feat!: add length-constrained branded string types and redefine NonEmptyString ([#406](https://github.com/noshiro-pf/ts-type-forge/issues/406)) ([0cbec25](https://github.com/noshiro-pf/ts-type-forge/commit/0cbec25b25dda25162db26046b73d304eb3dd418))

### BREAKING CHANGES

- `NonEmptyString` no longer carries the `'NonEmptyString'`
  brand key. It is now `Brand`-compatible with `MinLengthString<1>` instead
  of a standalone `Brand<string, 'NonEmptyString'>`. Values that were cast to
  `NonEmptyString` via the old brand key, or code that inspected the brand
  keys (e.g. `UnwrapBrandTrueKeys`), will observe a different brand shape.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: <https://claude.ai/code/session_01VfbfUoEnhGNsnmmbb8w9TB>

- refactor: re-organize src files

# [4.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v3.2.0...v4.0.0) (2026-06-27)

### Features

- **breaking:** add NonPositiveNumber ([#398](https://github.com/noshiro-pf/ts-type-forge/issues/398)) ([973217d](https://github.com/noshiro-pf/ts-type-forge/commit/973217da2f50d944132ed8a0bbdc9bacefeeb3cd))

# [3.2.0](https://github.com/noshiro-pf/ts-type-forge/compare/v3.1.0...v3.2.0) (2026-06-22)

### Features

- add NonEmptyString ([#396](https://github.com/noshiro-pf/ts-type-forge/issues/396)) ([bf4f73b](https://github.com/noshiro-pf/ts-type-forge/commit/bf4f73bda255048e36fcd8dfd954fe9b1be7db9c))

# [3.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v3.0.1...v3.1.0) (2026-06-01)

### Features

- add ArrayBoundedLen and ArrayAtMostLen type ([#379](https://github.com/noshiro-pf/ts-type-forge/issues/379)) ([ac5bebc](https://github.com/noshiro-pf/ts-type-forge/commit/ac5bebc5f3c3b6230eae0e5cce371a0f48694040))

## [3.0.1](https://github.com/noshiro-pf/ts-type-forge/compare/v3.0.0...v3.0.1) (2026-05-10)

### Bug Fixes

- fix dependencies ([#367](https://github.com/noshiro-pf/ts-type-forge/issues/367)) ([3375b5f](https://github.com/noshiro-pf/ts-type-forge/commit/3375b5f045aae2eac9f0339ab326971199bf28d2))

# [3.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.4.2...v3.0.0) (2026-05-06)

- feat!: ship as side-effect-free named-export library ([#365](https://github.com/noshiro-pf/ts-type-forge/issues/365)) ([f831899](https://github.com/noshiro-pf/ts-type-forge/commit/f8318991603348d016514c950606ce509214b6bb)), closes [#364](https://github.com/noshiro-pf/ts-type-forge/issues/364)

### BREAKING CHANGES

- ts-type-forge no longer exposes its types as ambient
  globals by default. Consumers that relied on
  `/// <reference types="ts-type-forge" />` to get every type globally
  must switch to `/// <reference types="ts-type-forge/global" />`, or
  move to explicit named imports. The `TSTypeForgeInternals` namespace
  has been flattened into `TSTypeForgeInternals_*` named exports. The
  package now ships `dist/` instead of `src/`.

## [2.4.2](https://github.com/noshiro-pf/ts-type-forge/compare/v2.4.1...v2.4.2) (2026-05-06)

### Bug Fixes

- update dependencies and import ts-type-forge explicitly ([#364](https://github.com/noshiro-pf/ts-type-forge/issues/364)) ([11f2310](https://github.com/noshiro-pf/ts-type-forge/commit/11f2310bc6fda2d7fe3129cd43a688863bfce6f6))

## [2.4.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.4.0...v2.4.1) (2026-04-23)

### Bug Fixes

- update deps ([#353](https://github.com/noshiro-pf/ts-type-forge/issues/353)) ([3201863](https://github.com/noshiro-pf/ts-type-forge/commit/3201863ad9565ee9e51457efb1714dd9ed79c191))

# [2.4.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.3.1...v2.4.0) (2026-04-03)

### Features

- add DeepPick, DeepOmit ([#332](https://github.com/noshiro-pf/ts-type-forge/issues/332)) ([5749976](https://github.com/noshiro-pf/ts-type-forge/commit/57499765aadffa4ebf56840d55536d9ab68fcf0a))

## [2.3.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.3.0...v2.3.1) (2026-01-23)

### Bug Fixes

- Change node version requirements ([#264](https://github.com/noshiro-pf/ts-type-forge/issues/264)) ([f8f88b9](https://github.com/noshiro-pf/ts-type-forge/commit/f8f88b906f01a30ce4ce79a79ed8309cf1164af8))

# [2.3.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.2.0...v2.3.0) (2025-10-15)

### Features

- AnyFn type ([#201](https://github.com/noshiro-pf/ts-type-forge/issues/201)) ([9f438de](https://github.com/noshiro-pf/ts-type-forge/commit/9f438de4f02d9351f09842ddfe0b806d86038af2))

# [2.2.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.1.1...v2.2.0) (2025-08-12)

### Features

- update Intersection type implementation ([#143](https://github.com/noshiro-pf/ts-type-forge/issues/143)) ([2bc1464](https://github.com/noshiro-pf/ts-type-forge/commit/2bc1464e84320f212e0415cb090663143bd44e0a))

## [2.1.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.1.0...v2.1.1) (2025-07-19)

### Bug Fixes

- fix DeepX types ([#111](https://github.com/noshiro-pf/ts-type-forge/issues/111)) ([ec2b8f7](https://github.com/noshiro-pf/ts-type-forge/commit/ec2b8f7469bf235051c983169f5ef854a74e6c58))

# [2.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.3...v2.1.0) (2025-07-07)

### Features

- NegativeIndexOfTuple ([#103](https://github.com/noshiro-pf/ts-type-forge/issues/103)) ([8a41128](https://github.com/noshiro-pf/ts-type-forge/commit/8a41128d4132639b7d2fe5f384b75bffbede03d8))

## [2.0.3](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.2...v2.0.3) (2025-06-15)

### Bug Fixes

- update README.md ([#74](https://github.com/noshiro-pf/ts-type-forge/issues/74)) ([2597b55](https://github.com/noshiro-pf/ts-type-forge/commit/2597b5526c7d896aaf64d641482e2f0f98706ea3))

## [2.0.2](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.1...v2.0.2) (2025-06-06)

### Bug Fixes

- update full API reference in README ([#61](https://github.com/noshiro-pf/ts-type-forge/issues/61)) ([5674f35](https://github.com/noshiro-pf/ts-type-forge/commit/5674f3531c9ad5a4bc68f4176df553bcd8922ff8))

## [2.0.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.0...v2.0.1) (2025-06-06)

### Bug Fixes

- use source-order in typedoc ([#59](https://github.com/noshiro-pf/ts-type-forge/issues/59)) ([11700f9](https://github.com/noshiro-pf/ts-type-forge/commit/11700f9816e6bdf93c9de53eb3ecc784f6b3c398))

# [2.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v1.1.0...v2.0.0) (2025-06-05)

### Features

- add branded number types ([#58](https://github.com/noshiro-pf/ts-type-forge/issues/58)) ([647e903](https://github.com/noshiro-pf/ts-type-forge/commit/647e90329740dffccdcf2c10a0bb27972b1e64e0))

### BREAKING CHANGES

- Renamed some types for branded number types and added many new branded number types.

Co-authored-by: github-actions[bot] <actions@github.com>

# [1.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v1.0.1...v1.1.0) (2025-06-01)

### Features

- add branded-types ([#54](https://github.com/noshiro-pf/ts-type-forge/issues/54)) ([86c462c](https://github.com/noshiro-pf/ts-type-forge/commit/86c462c2046b6b8bc3d1476e5fa0fab91b475620))

## [1.0.1](https://github.com/noshiro-pf/ts-type-forge/compare/v1.0.0...v1.0.1) (2025-05-06)

### Bug Fixes

- fix README ([#18](https://github.com/noshiro-pf/ts-type-forge/issues/18)) ([2fc136d](https://github.com/noshiro-pf/ts-type-forge/commit/2fc136d2e66cd7be2eaeada33bcabfbb72045f47))

# 1.0.0 (2025-05-06)

### Features

- add source and document files ([#7](https://github.com/noshiro-pf/ts-type-forge/issues/7)) ([3d13a20](https://github.com/noshiro-pf/ts-type-forge/commit/3d13a20513afd4b164ca344293c5bae0e6e04b22))
