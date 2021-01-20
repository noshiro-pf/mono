import { assertNotType, assertType, TypeExtends } from './test-type';

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56
type Append<Elm, T extends unknown[]> = ((
  arg: Elm,
  ...rest: T
) => void) extends (...args: infer T2) => void
  ? T2
  : never;

export type AtLeast<N extends number, T> = AtLeastRec<N, T, T[], []>;

type AtLeastRec<Num, Elm, T extends unknown[], C extends unknown[]> = {
  0: T;
  1: AtLeastRec<Num, Elm, Append<Elm, T>, Append<unknown, C>>;
}[C extends { length: Num } ? 0 : 1];

assertNotType<TypeExtends<[0, 1], AtLeast<3, number>>>();
assertType<TypeExtends<[0, 1, 2], AtLeast<3, number>>>();
assertNotType<TypeExtends<[0, 1, 2], AtLeast<5, number>>>();
assertType<TypeExtends<[0, 1, 2, 3, 4], AtLeast<5, number>>>();

export const isArrayOfLength1OrMore = <T>(
  array: readonly T[]
): array is AtLeast<1, T> => array.length >= 1;

export const isArrayOfLength2OrMore = <T>(
  array: readonly T[]
): array is AtLeast<2, T> => array.length >= 2;

export const isArrayOfLength3OrMore = <T>(
  array: readonly T[]
): array is AtLeast<3, T> => array.length >= 3;

export const isArrayOfLength4OrMore = <T>(
  array: readonly T[]
): array is AtLeast<4, T> => array.length >= 4;

export const isArrayOfLength5OrMore = <T>(
  array: readonly T[]
): array is AtLeast<5, T> => array.length >= 5;

export const isArrayOfLength6OrMore = <T>(
  array: readonly T[]
): array is AtLeast<6, T> => array.length >= 6;
