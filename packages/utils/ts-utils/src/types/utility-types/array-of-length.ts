import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type ArrayOfLength<N extends number, T> = ArrayOfLengthRec<N, T, []>;
export type ReadonlyArrayOfLength<N extends number, T> = Readonly<
  ArrayOfLength<N, T>
>;

type ArrayOfLengthRec<Num, Elm, T extends unknown[]> = {
  0: T;
  1: ArrayOfLengthRec<Num, Elm, [Elm, ...T]>;
}[T extends { length: Num } ? 0 : 1];

assertType<TypeEq<[0, 0], ArrayOfLength<2, 0>>>();
assertType<TypeEq<[0, 0, 0], ArrayOfLength<3, 0>>>();
assertType<TypeEq<[0, 0, 0, 0], ArrayOfLength<4, 0>>>();
assertType<TypeEq<[0, 0, 0, 0, 0], ArrayOfLength<5, 0>>>();

assertType<TypeEq<readonly [0, 0], ReadonlyArrayOfLength<2, 0>>>();
assertType<TypeEq<readonly [0, 0, 0], ReadonlyArrayOfLength<3, 0>>>();
assertType<TypeEq<readonly [0, 0, 0, 0], ReadonlyArrayOfLength<4, 0>>>();
assertType<TypeEq<readonly [0, 0, 0, 0, 0], ReadonlyArrayOfLength<5, 0>>>();

export const isArrayOfLength1 = <T>(
  array: readonly T[]
): array is ArrayOfLength<1, T> => array.length >= 1;

export const isArrayOfLength2 = <T>(
  array: readonly T[]
): array is ArrayOfLength<2, T> => array.length >= 2;

export const isArrayOfLength3 = <T>(
  array: readonly T[]
): array is ArrayOfLength<3, T> => array.length >= 3;

export const isArrayOfLength4 = <T>(
  array: readonly T[]
): array is ArrayOfLength<4, T> => array.length >= 4;

export const isArrayOfLength5 = <T>(
  array: readonly T[]
): array is ArrayOfLength<5, T> => array.length >= 5;

export const isArrayOfLength6 = <T>(
  array: readonly T[]
): array is ArrayOfLength<6, T> => array.length >= 6;
