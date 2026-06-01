import { expectType } from 'ts-data-forge';
import {
  type ArrayAtLeastLen,
  type ArrayAtMostLen,
  type ArrayBoundedLen,
  type ArrayOfLength,
  type MutableArrayAtMostLen,
  type MutableArrayBoundedLen,
  type MutableArrayOfLength,
} from './array.mjs';

expectType<[0, 0], MutableArrayOfLength<2, 0>>('=');

expectType<[0, 0, 0], MutableArrayOfLength<3, 0>>('=');

expectType<[0, 0, 0, 0], MutableArrayOfLength<4, 0>>('=');

expectType<[0, 0, 0, 0, 0], MutableArrayOfLength<5, 0>>('=');

expectType<readonly [0, 0], ArrayOfLength<2, 0>>('=');

expectType<readonly [0, 0, 0], ArrayOfLength<3, 0>>('=');

expectType<readonly [0, 0, 0, 0], ArrayOfLength<4, 0>>('=');

expectType<readonly [0, 0, 0, 0, 0], ArrayOfLength<5, 0>>('=');

expectType<ArrayOfLength<0, 0>, readonly []>('=');

expectType<ArrayOfLength<3, 0>, readonly [0, 0, 0]>('=');

expectType<ArrayOfLength<4, 1>, readonly [1, 1, 1, 1]>('=');

expectType<MutableArrayOfLength<4, 1>, [1, 1, 1, 1]>('=');

expectType<ArrayAtLeastLen<0, 0>, readonly 0[]>('=');

expectType<ArrayAtLeastLen<3, 0>, readonly [0, 0, 0, ...0[]]>('=');

expectType<ArrayAtLeastLen<4, 1>, readonly [1, 1, 1, 1, ...1[]]>('=');

// ArrayAtMostLen

expectType<ArrayAtMostLen<0, 0>, readonly []>('=');

expectType<ArrayAtMostLen<2, 0>, readonly [] | readonly [0] | readonly [0, 0]>(
  '=',
);

expectType<
  ArrayAtMostLen<3, 1>,
  readonly [] | readonly [1] | readonly [1, 1] | readonly [1, 1, 1]
>('=');

expectType<MutableArrayAtMostLen<2, 0>, [] | [0] | [0, 0]>('=');

// ArrayBoundedLen

expectType<ArrayBoundedLen<2, 2, 1>, readonly [1, 1]>('=');

expectType<
  ArrayBoundedLen<1, 3, 0>,
  readonly [0] | readonly [0, 0] | readonly [0, 0, 0]
>('=');

expectType<
  ArrayBoundedLen<0, 2, 1>,
  readonly [] | readonly [1] | readonly [1, 1]
>('=');

expectType<MutableArrayBoundedLen<1, 2, 1>, [1] | [1, 1]>('=');
