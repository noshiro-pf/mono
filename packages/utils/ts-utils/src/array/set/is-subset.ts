// TODO: improve performance
export const arrayIsSubset = <T>(
  arr1: readonly T[],
  arr2: readonly T[]
): boolean => arr1.every((e) => arr2.includes(e));
