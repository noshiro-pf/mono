import { expectType } from 'ts-data-forge';
import {
  type BoundedLengthTuple,
  type FixedLengthTuple,
  type MaxLengthTuple,
  type MinLengthTuple,
  type MutableBoundedLengthTuple,
  type MutableFixedLengthTuple,
  type MutableMaxLengthTuple,
} from './length-constrained-tuple.mjs';

expectType<readonly [0, 0], MutableFixedLengthTuple<2, 0>>('=');

expectType<readonly [0, 0, 0], MutableFixedLengthTuple<3, 0>>('=');

expectType<readonly [0, 0, 0, 0], MutableFixedLengthTuple<4, 0>>('=');

expectType<readonly [0, 0, 0, 0, 0], MutableFixedLengthTuple<5, 0>>('=');

expectType<readonly [0, 0], FixedLengthTuple<2, 0>>('=');

expectType<readonly [0, 0, 0], FixedLengthTuple<3, 0>>('=');

expectType<readonly [0, 0, 0, 0], FixedLengthTuple<4, 0>>('=');

expectType<readonly [0, 0, 0, 0, 0], FixedLengthTuple<5, 0>>('=');

expectType<FixedLengthTuple<0, 0>, readonly []>('=');

expectType<FixedLengthTuple<3, 0>, readonly [0, 0, 0]>('=');

expectType<FixedLengthTuple<4, 1>, readonly [1, 1, 1, 1]>('=');

expectType<MutableFixedLengthTuple<4, 1>, readonly [1, 1, 1, 1]>('=');

expectType<MinLengthTuple<0, 0>, readonly 0[]>('=');

expectType<MinLengthTuple<3, 0>, readonly [0, 0, 0, ...0[]]>('=');

expectType<MinLengthTuple<4, 1>, readonly [1, 1, 1, 1, ...1[]]>('=');

// MaxLengthTuple

expectType<MaxLengthTuple<0, 0>, readonly []>('=');

expectType<MaxLengthTuple<2, 0>, readonly [] | readonly [0] | readonly [0, 0]>(
  '=',
);

expectType<
  MaxLengthTuple<3, 1>,
  readonly [] | readonly [1] | readonly [1, 1] | readonly [1, 1, 1]
>('=');

expectType<
  MutableMaxLengthTuple<2, 0>,
  readonly [] | readonly [0] | readonly [0, 0]
>('=');

// BoundedLengthTuple

expectType<BoundedLengthTuple<2, 2, 1>, readonly [1, 1]>('=');

expectType<
  BoundedLengthTuple<1, 3, 0>,
  readonly [0] | readonly [0, 0] | readonly [0, 0, 0]
>('=');

expectType<
  BoundedLengthTuple<0, 2, 1>,
  readonly [] | readonly [1] | readonly [1, 1]
>('=');

expectType<MutableBoundedLengthTuple<1, 2, 1>, readonly [1] | readonly [1, 1]>(
  '=',
);
