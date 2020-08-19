export const concat = <T, S>(
  arr1: readonly T[],
  arr2: readonly S[]
): (T | S)[] => ([] as (T | S)[]).concat(arr1, arr2);
