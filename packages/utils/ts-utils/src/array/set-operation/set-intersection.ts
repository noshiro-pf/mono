export const arraySetIntersection = <T>(
  arr1: readonly T[],
  arr2: readonly T[]
): T[] => arr1.filter((e) => arr2.includes(e));
