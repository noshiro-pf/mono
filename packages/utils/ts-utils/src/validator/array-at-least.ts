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
