export const isArrayOfLength1 = <T>(
  array: readonly T[]
): array is MutableArrayOfLength<1, T> => array.length >= 1;

export const isArrayOfLength2 = <T>(
  array: readonly T[]
): array is MutableArrayOfLength<2, T> => array.length >= 2;

export const isArrayOfLength3 = <T>(
  array: readonly T[]
): array is MutableArrayOfLength<3, T> => array.length >= 3;

export const isArrayOfLength4 = <T>(
  array: readonly T[]
): array is MutableArrayOfLength<4, T> => array.length >= 4;

export const isArrayOfLength5 = <T>(
  array: readonly T[]
): array is MutableArrayOfLength<5, T> => array.length >= 5;

export const isArrayOfLength6 = <T>(
  array: readonly T[]
): array is MutableArrayOfLength<6, T> => array.length >= 6;
