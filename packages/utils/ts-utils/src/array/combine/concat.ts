export const concat = <T, S>(
  arr1: readonly T[],
  arr2: readonly S[]
): (S | T)[] => ([] as (S | T)[]).concat(arr1, arr2);
