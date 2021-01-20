// TODO: improve performance
/**
 * @returns if arr1 ⊂ arr2 true otherwise false
 */
export const arrayIsSubset = <T>(
  arr1: readonly T[],
  arr2: readonly T[]
): boolean => arr1.every((e) => arr2.includes(e));
