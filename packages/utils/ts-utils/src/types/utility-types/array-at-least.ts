import { assertNotType, assertType } from './test-type';

assertNotType<TypeExtends<[0, 1], ArrayAtLeastLen<3, number>>>();
assertType<TypeExtends<[0, 1, 2], ArrayAtLeastLen<3, number>>>();
assertNotType<TypeExtends<[0, 1, 2], ArrayAtLeastLen<5, number>>>();
assertType<TypeExtends<[0, 1, 2, 3, 4], ArrayAtLeastLen<5, number>>>();

assertType<TypeExtends<readonly [0, 0], ReadonlyArrayAtLeastLen<2, 0>>>();
assertType<TypeExtends<readonly [0, 0, 0], ReadonlyArrayAtLeastLen<3, 0>>>();
assertType<TypeExtends<readonly [0, 0, 0, 0], ReadonlyArrayAtLeastLen<4, 0>>>();
assertType<
  TypeExtends<readonly [0, 0, 0, 0, 0], ReadonlyArrayAtLeastLen<5, 0>>
>();

export const isArrayOfLength1OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<1, T> => array.length >= 1;

export const isArrayOfLength2OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<2, T> => array.length >= 2;

export const isArrayOfLength3OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<3, T> => array.length >= 3;

export const isArrayOfLength4OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<4, T> => array.length >= 4;

export const isArrayOfLength5OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<5, T> => array.length >= 5;

export const isArrayOfLength6OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<6, T> => array.length >= 6;
