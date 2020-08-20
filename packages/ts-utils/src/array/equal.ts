export const eq = <T>(array1: readonly T[], array2: readonly T[]): boolean =>
  array1.length === array2.length && array1.every((v, i) => v === array2[i]);
