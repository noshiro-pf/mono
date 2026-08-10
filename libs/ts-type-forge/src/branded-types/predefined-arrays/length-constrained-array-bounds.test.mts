import { expectType } from 'ts-data-forge';
import { type MinLengthTuple } from '../../tuple-and-list/index.mjs';
import { type TSTypeForgeInternals_BrandEncapsulated } from '../_internals.mjs';
import {
  type ChangeArrayElement,
  type HasLengthConstraint,
  type LengthConstraintBrandOf,
  type MaxLengthOf,
  type MinLengthOf,
} from './length-constrained-array-bounds.mjs';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from './length-constrained-array.mjs';

/* HasLengthConstraint */

expectType<HasLengthConstraint<MinLengthArray<3, string>>, true>('=');

expectType<HasLengthConstraint<MaxLengthArray<5, string>>, true>('=');

expectType<HasLengthConstraint<BoundedLengthArray<1, 5, string>>, true>('=');

expectType<HasLengthConstraint<FixedLengthArray<3, string>>, true>('=');

expectType<HasLengthConstraint<readonly [string, string]>, false>('=');

expectType<HasLengthConstraint<readonly string[]>, false>('=');

expectType<HasLengthConstraint<readonly []>, false>('=');

expectType<HasLengthConstraint<readonly [string, ...string[]]>, false>('=');

/* A *mutable* array is not brand-carrying either. Its mutating methods
   (`push`, `pop`, `splice`, ...) are absent from `keyof (readonly unknown[])`,
   so a key-subtraction that only mentions the readonly key set leaves them
   behind and reports every mutable array as branded. */

expectType<HasLengthConstraint<readonly string[]>, false>('=');

expectType<HasLengthConstraint<readonly [string, string]>, false>('=');

expectType<HasLengthConstraint<readonly []>, false>('=');

expectType<HasLengthConstraint<readonly [string, ...string[]]>, false>('=');

/* MinLengthOf */

expectType<MinLengthOf<MinLengthArray<0, string>>, 0>('=');

expectType<MinLengthOf<MinLengthArray<1, string>>, 1>('=');

expectType<MinLengthOf<MinLengthArray<3, string>>, 3>('=');

expectType<MinLengthOf<MinLengthArray<10, string>>, 10>('=');

expectType<MinLengthOf<MinLengthArray<12, string>>, 12>('=');

expectType<MinLengthOf<MinLengthArray<40, string>>, 40>('=');

expectType<MinLengthOf<BoundedLengthArray<2, 5, string>>, 2>('=');

expectType<MinLengthOf<FixedLengthArray<4, string>>, 4>('=');

// No lower bound in the brand.
expectType<MinLengthOf<MaxLengthArray<5, string>>, 0>('=');

expectType<MinLengthOf<readonly [string, string]>, 0>('=');

expectType<MinLengthOf<readonly string[]>, 0>('=');

/* MaxLengthOf */

expectType<MaxLengthOf<MaxLengthArray<0, string>>, 0>('=');

expectType<MaxLengthOf<MaxLengthArray<1, string>>, 1>('=');

expectType<MaxLengthOf<MaxLengthArray<5, string>>, 5>('=');

expectType<MaxLengthOf<MaxLengthArray<10, string>>, 10>('=');

expectType<MaxLengthOf<MaxLengthArray<40, string>>, 40>('=');

expectType<MaxLengthOf<BoundedLengthArray<2, 5, string>>, 5>('=');

expectType<MaxLengthOf<FixedLengthArray<4, string>>, 4>('=');

// No upper bound in the brand.
expectType<MaxLengthOf<MinLengthArray<3, string>>, never>('=');

expectType<MaxLengthOf<readonly [string, string]>, never>('=');

expectType<MaxLengthOf<readonly string[]>, never>('=');

/* LengthConstraintBrandOf */

expectType<
  readonly number[] & LengthConstraintBrandOf<MaxLengthArray<5, string>>,
  MaxLengthArray<5, number>
>('~=');

// A plain array or tuple contributes nothing.
expectType<
  readonly number[] & LengthConstraintBrandOf<readonly [string, string]>,
  readonly number[]
>('~=');

/* ChangeArrayElement */

// Unbranded inputs keep the homomorphic mapping exactly.
expectType<
  ChangeArrayElement<readonly [1, 2, 3], string>,
  readonly [string, string, string]
>('=');

expectType<ChangeArrayElement<readonly number[], string>, readonly string[]>(
  '=',
);

expectType<ChangeArrayElement<readonly [], string>, readonly []>('=');

// A mutable input maps homomorphically too, rather than picking up a brand
// made out of its own mutating methods.
expectType<ChangeArrayElement<readonly number[], string>, readonly string[]>(
  '=',
);

expectType<
  ChangeArrayElement<readonly [number, number], string>,
  readonly [string, string]
>('=');

expectType<
  ChangeArrayElement<readonly [number, ...number[]], string>,
  readonly [string, ...string[]]
>('=');

// Branded inputs keep their constraint.
expectType<
  ChangeArrayElement<MinLengthArray<3, number>, string>,
  MinLengthArray<3, string>
>('~=');

expectType<
  ChangeArrayElement<MinLengthArray<12, number>, string>,
  MinLengthArray<12, string>
>('~=');

expectType<
  ChangeArrayElement<MaxLengthArray<5, number>, string>,
  MaxLengthArray<5, string>
>('~=');

expectType<
  ChangeArrayElement<BoundedLengthArray<1, 5, number>, string>,
  BoundedLengthArray<1, 5, string>
>('~=');

expectType<
  ChangeArrayElement<FixedLengthArray<3, number>, string>,
  FixedLengthArray<3, string>
>('~=');

expectType<
  ChangeArrayElement<FixedLengthArray<0, number>, string>,
  FixedLengthArray<0, string>
>('~=');

// Above the structural prefix cap `FixedLengthArray` encodes no exact tuple
// either, so the reconstruction matches it there too.
expectType<
  ChangeArrayElement<FixedLengthArray<12, number>, string>,
  FixedLengthArray<12, string>
>('~=');

// The structural prefix survives, so in-range indexed access stays defined.
type Mapped = ChangeArrayElement<MinLengthArray<3, number>, string>;

expectType<Mapped[0], string>('=');

expectType<Mapped[2], string>('=');

/* A brand intersected with an exact tuple, as a ts-data-forge guard produces:
   `Arr.isMinLengthArray(3, xs)` narrows a five-tuple to
   `MinLengthArray<3, E> & readonly [a, b, c, d, e]`. The brand still reports
   what it alone guarantees, but the element swap keeps the exact length the
   tuple pins rather than falling back to the brand's weaker bound. */

type BrandedFiveTuple = MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5];

expectType<HasLengthConstraint<BrandedFiveTuple>, true>('=');

expectType<MinLengthOf<BrandedFiveTuple>, 3>('=');

expectType<MaxLengthOf<BrandedFiveTuple>, never>('=');

expectType<BrandedFiveTuple['length'], 5>('=');

type MappedExact = ChangeArrayElement<BrandedFiveTuple, string>;

expectType<
  MappedExact,
  readonly [string, string, string, string, string] &
    LengthConstraintBrandOf<BrandedFiveTuple>
>('=');

expectType<MappedExact['length'], 5>('=');

expectType<MappedExact[4], string>('=');

// The brand comes along, so the result is still recognizably constrained.
expectType<
  HasLengthConstraint<ChangeArrayElement<BrandedFiveTuple, string>>,
  true
>('=');

type BrandedThreeTuple = MaxLengthArray<9, number> & readonly [1, 2, 3];

type MappedBounded = ChangeArrayElement<BrandedThreeTuple, string>;

expectType<MappedBounded['length'], 3>('=');

expectType<MappedBounded[2], string>('=');

type ContradictoryLengthConstraints = MinLengthArray<6, number> &
  readonly [1, 2, 3, 4, 5];

expectType<
  ContradictoryLengthConstraints,
  MinLengthTuple<6, number> &
    TSTypeForgeInternals_BrandEncapsulated<
      Readonly<{
        MinLength: MinLengthTuple<6, 0>;
      }>
    > &
    readonly [1, 2, 3, 4, 5]
>('=');
