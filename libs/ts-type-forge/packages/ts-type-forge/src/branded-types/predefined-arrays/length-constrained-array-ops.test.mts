import { expectType } from 'ts-data-forge';
import {
  type FixedLengthTuple,
  type List,
  type MinLengthTuple,
  type Tuple,
} from '../../tuple-and-list/index.mjs';
import { type IndexInclusive } from '../../type-level-integer/index.mjs';
import { type TSTypeForgeInternals_BrandEncapsulated } from '../_internals.mjs';
import {
  type ChangeArrayElement,
  type HasLengthConstraint,
  type LengthConstraintBrandOf,
  type MaxLengthOf,
  type MinLengthOf,
} from './length-constrained-array-bounds.mjs';
import {
  type ConstrainedList,
  type NormalizeLengthConstraint,
} from './length-constrained-array-ops.mjs';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from './length-constrained-array.mjs';

/* Reverse */

expectType<
  ConstrainedList.Reverse<MinLengthArray<3, string>>,
  MinLengthArray<3, string>
>('~=');

expectType<
  ConstrainedList.Reverse<BoundedLengthArray<2, 5, string>>,
  BoundedLengthArray<2, 5, string>
>('~=');

// Unbranded inputs keep `List`'s behavior exactly.
expectType<ConstrainedList.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>(
  '=',
);

{
  // Inspect ConstrainedList.Reverse<BoundedLengthArray<2, 5, number> & readonly [1, 2, 3]>

  type Target = ConstrainedList.Reverse<
    readonly [1, 2, 3] & BoundedLengthArray<2, 5, number>
  >;

  expectType<
    Target,
    readonly [3, 2, 1] &
      FixedLengthTuple<3, 1 | 2 | 3> &
      LengthConstraintBrandOf<
        readonly number[] &
          TSTypeForgeInternals_BrandEncapsulated<
            Readonly<{
              MinLength: MinLengthTuple<2, 0>;
              MaxLength: IndexInclusive<5>;
            }>
          > &
          MinLengthTuple<2, number> &
          readonly [1, 2, 3]
      >
  >('=');

  expectType<
    LengthConstraintBrandOf<
      readonly [1, 2, 3] &
        readonly number[] &
        TSTypeForgeInternals_BrandEncapsulated<
          Readonly<{
            MinLength: MinLengthTuple<2, 0>;
            MaxLength: IndexInclusive<5>;
          }>
        > &
        MinLengthTuple<2, number>
    >,
    TSTypeForgeInternals_BrandEncapsulated<
      Readonly<{
        MinLength: MinLengthTuple<2, 0>;
        MaxLength: IndexInclusive<5>;
      }>
    >
  >('~=');

  expectType<
    Target,
    readonly [3, 2, 1] &
      FixedLengthTuple<3, 1 | 2 | 3> &
      TSTypeForgeInternals_BrandEncapsulated<
        Readonly<{
          MinLength: MinLengthTuple<2, 0>;
          MaxLength: IndexInclusive<5>;
        }>
      >
  >('~=');

  // The Target type in detail is:
  expectType<
    Target,
    readonly [3, 2, 1] &
      TSTypeForgeInternals_BrandEncapsulated<
        Readonly<{
          MinLength: MinLengthTuple<2, 0>;
          MaxLength: IndexInclusive<5>;
        }>
      >
  >('~=');

  // The expected type as a result of applying ConstrainedList.Reverse in a naive way is:
  expectType<
    BoundedLengthArray<2, 5, number> & readonly [3, 2, 1],
    readonly [3, 2, 1] &
      readonly number[] &
      TSTypeForgeInternals_BrandEncapsulated<
        Readonly<{
          MinLength: MinLengthTuple<2, 0>;
          MaxLength: IndexInclusive<5>;
        }>
      > &
      MinLengthTuple<2, number>
  >('~=');
}

expectType<ConstrainedList.Reverse<readonly string[]>, readonly string[]>('=');

/* NormalizeLengthConstraint
 *
 * The block above shows the same type written two ways: what `ConstrainedList`
 * answers, and what applying the operation to each half separately gives. They
 * are mutually assignable but not the same *shape*, because the family expands
 * structurally and an intersection keeps every conjunct. Normalizing collapses
 * both to the two-conjunct normal form — the exact tuple plus the brand. */

{
  type Brand = BoundedLengthArray<2, 5, number>;

  type Normal = readonly [3, 2, 1] &
    TSTypeForgeInternals_BrandEncapsulated<
      Readonly<{
        MinLength: MinLengthTuple<2, 0>;
        MaxLength: IndexInclusive<5>;
      }>
    >;

  // The naive hand-written intersection.
  expectType<NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>, Normal>(
    '~=',
  );

  // What `ConstrainedList.Reverse` answers.
  expectType<
    NormalizeLengthConstraint<
      ConstrainedList.Reverse<Brand & readonly [1, 2, 3]>
    >,
    Normal
  >('~=');

  // Applying the operation to each half separately.
  expectType<
    NormalizeLengthConstraint<
      ConstrainedList.Reverse<Brand> & List.Reverse<readonly [1, 2, 3]>
    >,
    Normal
  >('~=');

  // Normalizing is idempotent.
  expectType<
    NormalizeLengthConstraint<
      NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>
    >,
    NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>
  >('=');

  // It is the same type, not a narrower one — assignable both ways.
  expectType<
    NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>,
    Brand & readonly [3, 2, 1]
  >('~=');

  // The brand survives, so the bounds accessors still answer the same.
  expectType<
    HasLengthConstraint<NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>>,
    true
  >('=');

  expectType<
    MinLengthOf<NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>>,
    2
  >('=');

  expectType<
    MaxLengthOf<NormalizeLengthConstraint<Brand & readonly [3, 2, 1]>>,
    5
  >('=');
}

// An input pinning no exact length is already in normal form.
expectType<
  NormalizeLengthConstraint<MinLengthArray<3, string>>,
  MinLengthArray<3, string>
>('=');

expectType<NormalizeLengthConstraint<readonly string[]>, readonly string[]>(
  '=',
);

// A plain tuple has no brand to keep, so it comes back as itself.
expectType<NormalizeLengthConstraint<readonly [1, 2, 3]>, readonly [1, 2, 3]>(
  '~=',
);

// `ChangeArrayElement` already answers in normal form for a branded tuple.
expectType<
  NormalizeLengthConstraint<
    ChangeArrayElement<
      MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5],
      string
    >
  >,
  ChangeArrayElement<
    MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5],
    string
  >
>('~=');

// Past the rebuild cap (32) the tuple is left alone rather than rebuilt one
// index at a time, so the type comes back untouched. That only ever leaves the
// spelling longer, never wrong.
expectType<
  NormalizeLengthConstraint<
    MinLengthArray<3, number> & FixedLengthTuple<33, number>
  >,
  MinLengthArray<3, number> & FixedLengthTuple<33, number>
>('=');

// A brand that contradicts its tuple. `Arr.isMinLengthArray(6, xs)` can never
// produce this — the guard checked the length — but the type is writable by
// hand, and there normalizing is NOT type-preserving: the dropped
// `MinLengthTuple<6, number>` conjunct is the one the five-tuple does not
// imply, so the result is strictly wider. Consistency between the brand and
// the tuple is the precondition; every guard-produced type satisfies it.
{
  type Contradictory = MinLengthArray<6, number> & readonly [1, 2, 3, 4, 5];

  expectType<NormalizeLengthConstraint<Contradictory>, Contradictory>('>=');

  // The structural half still wins when an operation reads the bounds, so
  // nothing here loops or exceeds the instantiation limit.
  expectType<
    ConstrainedList.Tail<Contradictory>,
    readonly [2, 3, 4, 5] &
      LengthConstraintBrandOf<ConstrainedList.Tail<Contradictory>>
  >('~=');
}

/* SetAt */

expectType<
  ConstrainedList.SetAt<MinLengthArray<3, number>, 1, 'x'>,
  MinLengthArray<3, number | 'x'>
>('~=');

expectType<
  ConstrainedList.SetAt<readonly [1, 2, 3], 1, 'x'>,
  readonly [1, 'x', 3]
>('=');

/* Tail / ButLast */

expectType<
  ConstrainedList.Tail<MinLengthArray<3, string>>,
  MinLengthArray<2, string>
>('=');

expectType<
  ConstrainedList.Tail<BoundedLengthArray<2, 5, string>>,
  BoundedLengthArray<1, 4, string>
>('=');

expectType<
  ConstrainedList.Tail<FixedLengthArray<3, string>>,
  FixedLengthArray<2, string>
>('=');

// The minimum saturates at 0 rather than going negative.
expectType<
  ConstrainedList.Tail<MaxLengthArray<3, string>>,
  MaxLengthArray<2, string>
>('=');

expectType<
  ConstrainedList.ButLast<BoundedLengthArray<2, 5, string>>,
  BoundedLengthArray<1, 4, string>
>('=');

expectType<ConstrainedList.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');

/* Take / TakeLast */

// This is the case `List.Take` gets wrong: it would answer
// `MinLengthArray<5, string>` for a two-element result.
expectType<
  ConstrainedList.Take<2, MinLengthArray<5, string>>,
  FixedLengthArray<2, string>
>('=');

// Taking more than the minimum leaves the minimum where it was.
expectType<
  ConstrainedList.Take<8, MinLengthArray<5, string>>,
  BoundedLengthArray<5, 8, string>
>('=');

expectType<
  ConstrainedList.Take<3, BoundedLengthArray<2, 5, string>>,
  BoundedLengthArray<2, 3, string>
>('=');

// An unbounded input becomes bounded: at most `N` elements come back.
expectType<
  ConstrainedList.Take<4, MinLengthArray<2, string>>,
  BoundedLengthArray<2, 4, string>
>('=');

expectType<
  ConstrainedList.TakeLast<2, MinLengthArray<5, string>>,
  FixedLengthArray<2, string>
>('=');

expectType<ConstrainedList.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');

/* Skip / SkipLast */

expectType<
  ConstrainedList.Skip<2, MinLengthArray<5, string>>,
  MinLengthArray<3, string>
>('=');

expectType<
  ConstrainedList.Skip<2, BoundedLengthArray<3, 7, string>>,
  BoundedLengthArray<1, 5, string>
>('=');

// Skipping past the whole range leaves nothing to promise.
expectType<
  ConstrainedList.Skip<9, BoundedLengthArray<3, 7, string>>,
  FixedLengthArray<0, string>
>('=');

expectType<
  ConstrainedList.SkipLast<2, MinLengthArray<5, string>>,
  MinLengthArray<3, string>
>('=');

expectType<ConstrainedList.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');

/* Concat */

expectType<
  ConstrainedList.Concat<MinLengthArray<2, string>, MinLengthArray<3, string>>,
  MinLengthArray<5, string>
>('=');

expectType<
  ConstrainedList.Concat<
    BoundedLengthArray<1, 3, string>,
    BoundedLengthArray<2, 4, string>
  >,
  BoundedLengthArray<3, 7, string>
>('=');

// An unbounded side leaves the result unbounded above.
expectType<
  ConstrainedList.Concat<
    BoundedLengthArray<1, 3, string>,
    MinLengthArray<2, string>
  >,
  MinLengthArray<3, string>
>('=');

expectType<
  ConstrainedList.Concat<readonly [1, 2], readonly [3, 4]>,
  readonly [1, 2, 3, 4]
>('=');

/* Zip */

expectType<
  ConstrainedList.Zip<MinLengthArray<2, string>, MinLengthArray<5, number>>,
  MinLengthArray<2, readonly [string, number]>
>('=');

expectType<
  ConstrainedList.Zip<
    BoundedLengthArray<2, 6, string>,
    BoundedLengthArray<3, 4, number>
  >,
  BoundedLengthArray<2, 4, readonly [string, number]>
>('=');

expectType<
  ConstrainedList.Zip<readonly [1, 2], readonly ['a', 'b']>,
  readonly [readonly [1, 'a'], readonly [2, 'b']]
>('=');

/* The structural prefix survives, so in-range indexed access stays defined. */

type Taken = ConstrainedList.Take<2, MinLengthArray<5, string>>;

expectType<Taken[0], string>('=');

expectType<Taken[1], string>('=');

type Tailed = ConstrainedList.Tail<MinLengthArray<3, string>>;

expectType<Tailed[0], string>('=');

/* A brand intersected with an exact tuple — what a ts-data-forge guard
   produces, e.g. `Arr.isMinLengthArray(3, xs)` on a five-tuple. The tuple pins
   the length where the brand only bounds it, and it also pins every position,
   so the result carries both: the recomputed brand and the exact tuple. */

type BrandedFiveTuple = MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5];

type Elm5 = 1 | 2 | 3 | 4 | 5;

expectType<
  ConstrainedList.Tail<BrandedFiveTuple>,
  FixedLengthArray<4, Elm5> & readonly [2, 3, 4, 5]
>('=');

expectType<
  ConstrainedList.ButLast<BrandedFiveTuple>,
  FixedLengthArray<4, Elm5> & readonly [1, 2, 3, 4]
>('=');

expectType<
  ConstrainedList.Take<2, BrandedFiveTuple>,
  FixedLengthArray<2, Elm5> & readonly [1, 2]
>('=');

expectType<
  ConstrainedList.TakeLast<2, BrandedFiveTuple>,
  FixedLengthArray<2, Elm5> & readonly [4, 5]
>('=');

expectType<
  ConstrainedList.Skip<2, BrandedFiveTuple>,
  FixedLengthArray<3, Elm5> & readonly [3, 4, 5]
>('=');

expectType<
  ConstrainedList.SkipLast<2, BrandedFiveTuple>,
  FixedLengthArray<3, Elm5> & readonly [1, 2, 3]
>('=');

// Reversal and replacement recover the positions the brand alone flattens to a
// union. These two change no length, so they carry the input's own brand over
// rather than recomputing one — the exact length is already pinned structurally.
expectType<
  ConstrainedList.Reverse<BrandedFiveTuple>,
  MinLengthArray<3, Elm5> & readonly [5, 4, 3, 2, 1]
>('~=');

expectType<
  ConstrainedList.SetAt<BrandedFiveTuple, 1, 'x'>,
  MinLengthArray<3, Elm5 | 'x'> & readonly [1, 'x', 3, 4, 5]
>('~=');

// Taking more than the input holds yields the whole input, not `N` elements.
expectType<
  ConstrainedList.Take<9, BrandedFiveTuple>,
  FixedLengthArray<5, Elm5> & readonly [1, 2, 3, 4, 5]
>('=');

// An upper-bound brand over a shorter tuple: the tuple wins there too, so the
// result is exactly two rather than "at most eight".
type BrandedThreeTuple = MaxLengthArray<9, number> & readonly [1, 2, 3];

expectType<
  ConstrainedList.Tail<BrandedThreeTuple>,
  FixedLengthArray<2, 1 | 2 | 3> & readonly [2, 3]
>('=');

expectType<
  ConstrainedList.Concat<BrandedThreeTuple, MinLengthArray<2, string>>,
  MinLengthArray<5, 1 | 2 | 3 | string>
>('=');

// Zipping stops at the shorter side, so the exact length of the tuple becomes
// the upper bound of an otherwise unbounded result.
expectType<
  ConstrainedList.Zip<BrandedFiveTuple, MinLengthArray<2, string>>,
  BoundedLengthArray<2, 5, readonly [1 | 2 | 3 | 4 | 5, string]>
>('=');

/* Head / Last / Partition / Flatten */

expectType<ConstrainedList.Head<BrandedFiveTuple>, 1>('=');

expectType<ConstrainedList.Last<BrandedFiveTuple>, 5>('=');

expectType<
  ConstrainedList.Partition<2, BrandedFiveTuple>,
  readonly BoundedLengthArray<1, 2, Elm5>[] &
    readonly [readonly [1, 2], readonly [3, 4], readonly [5]]
>('=');

// A brand alone cannot say which element is first, only that there is one.
expectType<ConstrainedList.Head<MinLengthArray<3, string>>, string>('=');

expectType<ConstrainedList.Last<MinLengthArray<3, string>>, string>('=');

// With no lower bound the head may be absent, so the default shows up.
expectType<
  ConstrainedList.Head<MaxLengthArray<5, string>, 'none'>,
  string | 'none'
>('=');

expectType<
  ConstrainedList.Partition<2, MinLengthArray<3, string>>,
  readonly BoundedLengthArray<1, 2, string>[]
>('=');

// Unbranded inputs keep `List`'s behavior exactly.
expectType<ConstrainedList.Head<readonly [1, 2, 3]>, 1>('=');

expectType<ConstrainedList.Last<readonly [1, 2, 3]>, 3>('=');

expectType<
  ConstrainedList.Partition<2, readonly [1, 2, 3]>,
  readonly [readonly [1, 2], readonly [3]]
>('=');

/* What the raw `List` / `Tuple` namespaces do with the same input.
 *
 * These are not aspirations — they pin the current behavior, so that the
 * reason `ConstrainedList` exists stays visible and a future improvement to
 * `List` is noticed here rather than silently diverging. `List` and `Tuple`
 * are deliberately left brand-unaware: variadic `infer` cannot see through the
 * brand intersection, so every match falls through to the default branch. */

// The element type is lost entirely, not merely the length.
expectType<List.Tail<BrandedFiveTuple>, readonly unknown[]>('=');

expectType<List.ButLast<BrandedFiveTuple>, readonly unknown[]>('=');

expectType<List.Skip<2, BrandedFiveTuple>, readonly unknown[]>('=');

expectType<Tuple.Tail<BrandedFiveTuple>, readonly unknown[]>('=');

// `Take` keeps the first position (indexed access does reach through the
// intersection) but not the rest.
expectType<List.Take<2, BrandedFiveTuple>, readonly [1, unknown]>('=');

expectType<List.Last<BrandedFiveTuple>, unknown>('=');

// Evaluating the tuple half alone gives the answers `ConstrainedList` now
// reproduces, which is what makes the results above a defect rather than a
// limitation of the operation.
expectType<List.Tail<readonly [1, 2, 3, 4, 5]>, readonly [2, 3, 4, 5]>('=');

expectType<List.Take<2, readonly [1, 2, 3, 4, 5]>, readonly [1, 2]>('=');

expectType<List.Last<readonly [1, 2, 3, 4, 5]>, 5>('=');

/* Three members do not merely lose information — they exceed the
 * instantiation-depth limit outright, so a caller cannot even spell the
 * result. `@ts-expect-error` pins that: if `List` ever learns to handle the
 * intersection, these lines start failing and this block should go.
 *
 * These four lines cost more than the rest of this file put together (~29k
 * instantiations), because each runs to the depth limit before erroring. That
 * is inherent to what they document, not a sign they can be written cheaper. */

// @ts-expect-error TS2589: Type instantiation is excessively deep.
export type ListReverseOfBranded = List.Reverse<BrandedFiveTuple>;

// @ts-expect-error TS2589: Type instantiation is excessively deep.
export type ListSetAtOfBranded = List.SetAt<BrandedFiveTuple, 1, 'x'>;

// @ts-expect-error TS2589: Type instantiation is excessively deep.
export type ListPartitionOfBranded = List.Partition<2, BrandedFiveTuple>;

// @ts-expect-error TS2589: Type instantiation is excessively deep.
export type TupleReverseOfBranded = Tuple.Reverse<BrandedFiveTuple>;
