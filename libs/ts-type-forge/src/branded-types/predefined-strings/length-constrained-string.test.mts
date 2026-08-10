import { expectType } from 'ts-data-forge';
import {
  type BoundedLengthString,
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
} from './length-constrained-string.mjs';

// MaxLengthString

{
  expectType<
    MaxLengthString<3>,
    string &
      Readonly<
        {
          MaxLength: 0 | 1 | 2 | 3;
        } & {
          'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
        }
      >
  >('=');

  // Covariance: M <= N implies MaxLengthString<M> <= MaxLengthString<N>
  expectType<MaxLengthString<3>, MaxLengthString<5>>('<=');

  expectType<MaxLengthString<0>, MaxLengthString<1>>('<=');

  expectType<MaxLengthString<0>, MaxLengthString<255>>('<=');

  expectType<MaxLengthString<0>, MaxLengthString<2048>>('<=');

  // Negative direction
  expectType<MaxLengthString<5>, MaxLengthString<3>>('!<=');

  expectType<MaxLengthString<1>, MaxLengthString<0>>('!<=');

  // Subtype of string, but plain string is not assignable to it
  expectType<MaxLengthString<3>, string>('<=');

  expectType<string, MaxLengthString<3>>('!<=');
}

// MinLengthString

{
  expectType<
    MinLengthString<3>,
    string &
      Readonly<
        {
          MinLength: readonly [0, 0, 0, ...0[]];
        } & {
          'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
        }
      >
  >('=');

  // M >= N implies MinLengthString<M> <= MinLengthString<N>
  expectType<MinLengthString<5>, MinLengthString<3>>('<=');

  expectType<MinLengthString<1>, MinLengthString<0>>('<=');

  expectType<MinLengthString<255>, MinLengthString<0>>('<=');

  expectType<MinLengthString<2048>, MinLengthString<0>>('<=');

  // Negative direction
  expectType<MinLengthString<3>, MinLengthString<5>>('!<=');

  expectType<MinLengthString<0>, MinLengthString<1>>('!<=');

  // Subtype of string, but plain string is not assignable to it
  expectType<MinLengthString<3>, string>('<=');

  expectType<string, MinLengthString<3>>('!<=');
}

// MinLengthString and MaxLengthString are independent brands

{
  expectType<MinLengthString<3>, MaxLengthString<3>>('!<=');

  expectType<MaxLengthString<3>, MinLengthString<3>>('!<=');
}

// BoundedLengthString

{
  expectType<
    BoundedLengthString<2, 5>,
    string &
      Readonly<
        {
          MinLength: readonly [0, 0, ...0[]];
        } & {
          MaxLength: 0 | 1 | 2 | 3 | 4 | 5;
        } & {
          'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
        }
      >
  >('=');

  expectType<
    BoundedLengthString<2, 5>,
    MaxLengthString<5> & MinLengthString<2>
  >('=');

  // Weakening either bound is allowed
  expectType<BoundedLengthString<2, 5>, MaxLengthString<5>>('<=');

  expectType<BoundedLengthString<2, 5>, MaxLengthString<10>>('<=');

  expectType<BoundedLengthString<2, 5>, MinLengthString<2>>('<=');

  expectType<BoundedLengthString<2, 5>, MinLengthString<1>>('<=');

  expectType<BoundedLengthString<2, 5>, BoundedLengthString<1, 10>>('<=');

  expectType<BoundedLengthString<2, 5>, string>('<=');

  // Strengthening a bound is not allowed
  expectType<BoundedLengthString<1, 10>, BoundedLengthString<2, 5>>('!<=');

  expectType<BoundedLengthString<2, 5>, MaxLengthString<4>>('!<=');

  expectType<BoundedLengthString<2, 5>, MinLengthString<3>>('!<=');

  expectType<string, BoundedLengthString<2, 5>>('!<=');
}

// FixedLengthString

{
  expectType<
    FixedLengthString<3>,
    string &
      Readonly<
        {
          MinLength: readonly [0, 0, 0, ...0[]];
        } & {
          MaxLength: 0 | 1 | 2 | 3;
        } & {
          'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
        }
      >
  >('=');

  expectType<FixedLengthString<3>, BoundedLengthString<3, 3>>('=');

  expectType<FixedLengthString<3>, BoundedLengthString<0, 3>>('<=');

  expectType<FixedLengthString<3>, BoundedLengthString<3, 100>>('<=');

  expectType<FixedLengthString<3>, MaxLengthString<3>>('<=');

  expectType<FixedLengthString<3>, MinLengthString<3>>('<=');

  expectType<FixedLengthString<3>, FixedLengthString<4>>('!<=');

  expectType<FixedLengthString<4>, FixedLengthString<3>>('!<=');

  expectType<BoundedLengthString<3, 3>, FixedLengthString<4>>('!<=');
}

// Length parameters are capped at 2048 (SupportedLength); larger literals and
// non-literal `number` are rejected with a constraint error

{
  // The cap itself is usable (smoke test against instantiation-depth limits)
  expectType<MaxLengthString<2048>, string>('<=');

  expectType<MinLengthString<2048>, MinLengthString<2047>>('<=');

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeMax = MaxLengthString<2049>;

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeMin = MinLengthString<2049>;

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeBounded = BoundedLengthString<0, 2049>;

  // @ts-expect-error 2049 exceeds the supported length cap
  type _TooLargeFixed = FixedLengthString<2049>;

  // @ts-expect-error non-literal number is rejected
  type _NonLiteral = FixedLengthString<number>;
}
