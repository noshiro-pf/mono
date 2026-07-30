import { expectType } from 'ts-data-forge';
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
declare const _mapped: ChangeArrayElement<MinLengthArray<3, number>, string>;

expectType<(typeof _mapped)[0], string>('=');

expectType<(typeof _mapped)[2], string>('=');
