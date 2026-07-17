import { expectType } from 'ts-data-forge';
import { type FixedLengthTuple } from '../../tuple-and-list/index.mjs';
import { type MaxLengthString } from '../predefined-strings/index.mjs';
import { type SupportedLength } from '../supported-length.mjs';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from './length-constrained-array.mjs';

// MaxLengthArray

{
  expectType<
    MaxLengthArray<3, number>,
    readonly number[] &
      Readonly<{
        MaxLength: 0 | 1 | 2 | 3;
      }> &
      Readonly<{
        'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
      }>
  >('=');

  // Reflexivity
  expectType<MaxLengthArray<3, number>, MaxLengthArray<3, number>>('=');

  // Covariance in the bound: M <= N implies MaxLengthArray<M> <= MaxLengthArray<N>
  expectType<MaxLengthArray<3, number>, MaxLengthArray<5, number>>('<=');

  expectType<MaxLengthArray<0, number>, MaxLengthArray<1, number>>('<=');

  expectType<MaxLengthArray<0, number>, MaxLengthArray<255, number>>('<=');

  // Negative direction
  expectType<MaxLengthArray<5, number>, MaxLengthArray<3, number>>('!<=');

  expectType<MaxLengthArray<1, number>, MaxLengthArray<0, number>>('!<=');

  // Covariance in the element type
  expectType<MaxLengthArray<3, 1 | 2>, MaxLengthArray<3, number>>('<=');

  expectType<MaxLengthArray<3, number>, MaxLengthArray<3, 1 | 2>>('!<=');

  // Elm defaults to unknown
  expectType<MaxLengthArray<3, number>, MaxLengthArray<3>>('<=');

  // Subtype of readonly Elm[], but a plain array is not assignable to it
  expectType<MaxLengthArray<3, number>, readonly number[]>('<=');

  expectType<readonly number[], MaxLengthArray<3, number>>('!<=');
}

// MinLengthArray

{
  expectType<
    MinLengthArray<3, number>,
    readonly [number, number, number, ...(readonly number[])] &
      Readonly<{
        MinLength: readonly [0, 0, 0, ...(readonly 0[])];
      }> &
      Readonly<{
        'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
      }>
  >('=');

  // Reflexivity
  expectType<MinLengthArray<3, number>, MinLengthArray<3, number>>('=');

  // M >= N implies MinLengthArray<M> <= MinLengthArray<N>
  expectType<MinLengthArray<5, number>, MinLengthArray<3, number>>('<=');

  expectType<MinLengthArray<1, number>, MinLengthArray<0, number>>('<=');

  // Holds across the structural-prefix cap (10) in both directions
  expectType<MinLengthArray<255, number>, MinLengthArray<0, number>>('<=');

  expectType<MinLengthArray<12, number>, MinLengthArray<5, number>>('<=');

  expectType<MinLengthArray<12, number>, MinLengthArray<11, number>>('<=');

  // Negative direction
  expectType<MinLengthArray<3, number>, MinLengthArray<5, number>>('!<=');

  expectType<MinLengthArray<0, number>, MinLengthArray<1, number>>('!<=');

  expectType<MinLengthArray<11, number>, MinLengthArray<12, number>>('!<=');

  // Covariance in the element type
  expectType<MinLengthArray<3, 1 | 2>, MinLengthArray<3, number>>('<=');

  expectType<MinLengthArray<3, number>, MinLengthArray<3, 1 | 2>>('!<=');

  // Elm defaults to unknown
  expectType<MinLengthArray<3, number>, MinLengthArray<3>>('<=');

  // Subtype of readonly Elm[], but a plain array is not assignable to it
  expectType<MinLengthArray<3, number>, readonly number[]>('<=');

  expectType<readonly number[], MinLengthArray<3, number>>('!<=');

  // Also a subtype of the structural at-least tuple (up to the prefix cap)
  expectType<
    MinLengthArray<3, number>,
    readonly [number, number, number, ...(readonly number[])]
  >('<=');
}

// Indexed access below the (clamped) minimum length does not include
// `undefined` even under `noUncheckedIndexedAccess`

declare const min3: MinLengthArray<3, number>;

declare const min12: MinLengthArray<12, number>;

{
  const _min3At0 = min3[0];

  expectType<typeof _min3At0, number>('=');

  const _min3At2 = min3[2];

  expectType<typeof _min3At2, number>('=');

  const _min3At3 = min3[3];

  expectType<typeof _min3At3, number | undefined>('=');

  // The structural prefix is clamped at 10 for larger bounds
  const _min12At9 = min12[9];

  expectType<typeof _min12At9, number>('=');

  const _min12At10 = min12[10];

  expectType<typeof _min12At10, number | undefined>('=');
}

// MinLengthArray and MaxLengthArray are independent brands

{
  expectType<MinLengthArray<3, number>, MaxLengthArray<3, number>>('!<=');

  expectType<MaxLengthArray<3, number>, MinLengthArray<3, number>>('!<=');
}

// The array brands are independent of the string brands with the same keys

{
  expectType<MaxLengthString<3>, MaxLengthArray<3, string>>('!<=');

  expectType<MaxLengthArray<3, string>, MaxLengthString<3>>('!<=');
}

// BoundedLengthArray

declare const bounded25: BoundedLengthArray<2, 5, number>;

{
  expectType<
    BoundedLengthArray<2, 5, number>,
    MaxLengthArray<5, number> & MinLengthArray<2, number>
  >('=');

  // Weakening either bound is allowed
  expectType<BoundedLengthArray<2, 5, number>, MaxLengthArray<5, number>>('<=');

  expectType<BoundedLengthArray<2, 5, number>, MaxLengthArray<10, number>>(
    '<=',
  );

  expectType<BoundedLengthArray<2, 5, number>, MinLengthArray<2, number>>('<=');

  expectType<BoundedLengthArray<2, 5, number>, MinLengthArray<1, number>>('<=');

  expectType<
    BoundedLengthArray<2, 5, number>,
    BoundedLengthArray<1, 10, number>
  >('<=');

  expectType<BoundedLengthArray<2, 5, number>, readonly number[]>('<=');

  // Strengthening a bound is not allowed
  expectType<
    BoundedLengthArray<1, 10, number>,
    BoundedLengthArray<2, 5, number>
  >('!<=');

  expectType<BoundedLengthArray<2, 5, number>, MaxLengthArray<4, number>>(
    '!<=',
  );

  expectType<BoundedLengthArray<2, 5, number>, MinLengthArray<3, number>>(
    '!<=',
  );

  expectType<readonly number[], BoundedLengthArray<2, 5, number>>('!<=');

  // Indexed access below the minimum length does not include `undefined`
  const _bounded25At1 = bounded25[1];

  expectType<typeof _bounded25At1, number>('=');

  const _bounded25At2 = bounded25[2];

  expectType<typeof _bounded25At2, number | undefined>('=');
}

// FixedLengthArray

declare const fixed3: FixedLengthArray<3, number>;

{
  // Up to the prefix cap, the structural part is the exact tuple, so `length`
  // is the literal `N` and in-range indexed access does not include `undefined`
  expectType<
    FixedLengthArray<3, number>,
    BoundedLengthArray<3, 3, number> & FixedLengthTuple<3, number>
  >('=');

  expectType<FixedLengthArray<3, number>['length'], 3>('=');

  const _fixed3At0 = fixed3[0];

  expectType<typeof _fixed3At0, number>('=');

  const _fixed3At2 = fixed3[2];

  expectType<typeof _fixed3At2, number>('=');

  // Beyond the prefix cap, only the clamped structural prefix remains
  expectType<FixedLengthArray<12, number>, BoundedLengthArray<12, 12, number>>(
    '=',
  );

  expectType<FixedLengthArray<12, number>['length'], number>('=');

  expectType<FixedLengthArray<3, number>, BoundedLengthArray<0, 3, number>>(
    '<=',
  );

  expectType<FixedLengthArray<3, number>, BoundedLengthArray<3, 100, number>>(
    '<=',
  );

  expectType<FixedLengthArray<3, number>, MaxLengthArray<3, number>>('<=');

  expectType<FixedLengthArray<3, number>, MinLengthArray<3, number>>('<=');

  expectType<FixedLengthArray<3, number>, FixedLengthArray<4, number>>('!<=');

  expectType<FixedLengthArray<4, number>, FixedLengthArray<3, number>>('!<=');

  expectType<BoundedLengthArray<3, 3, number>, FixedLengthArray<4, number>>(
    '!<=',
  );
}

// Relation to the structural tuple family (FixedLengthTuple etc.)

{
  // The hybrid FixedLengthArray is assignable to the structural tuple
  // (up to the prefix cap), but not vice versa (the brand is missing)
  expectType<FixedLengthArray<3, number>, FixedLengthTuple<3, number>>('<=');

  expectType<FixedLengthTuple<3, number>, FixedLengthArray<3, number>>('!<=');
}

// Supports large length parameters that the tuple-based family cannot handle
// (MaxLengthTuple / BoundedLengthTuple hit the recursion limit around N > 100)

{
  expectType<MaxLengthArray<500, number>, MaxLengthArray<1000, number>>('<=');

  expectType<MinLengthArray<1000, number>, MinLengthArray<500, number>>('<=');

  expectType<
    BoundedLengthArray<100, 1000, number>,
    BoundedLengthArray<0, 2000, number>
  >('<=');
}

// Length parameters are capped at 2048 (SupportedLength); larger literals
// are rejected with a constraint error instead of a deep-instantiation error

{
  expectType<2048, SupportedLength>('<=');

  expectType<2049, SupportedLength>('!<=');

  // The cap itself is usable
  expectType<MaxLengthArray<2048, number>, MaxLengthArray<2048, number>>('=');

  expectType<MinLengthArray<2048, number>, MinLengthArray<2047, number>>('<=');

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeMax = MaxLengthArray<2049, number>;

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeMin = MinLengthArray<2049, number>;

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeBounded = BoundedLengthArray<0, 2049, number>;

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeFixed = FixedLengthArray<2049, number>;

  // @ts-expect-error non-literal number is rejected
  type _NonLiteral = FixedLengthArray<number, number>;
}
