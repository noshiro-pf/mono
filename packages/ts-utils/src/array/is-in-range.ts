export const indexIsInRange = <T>(index: number, arr: readonly T[]): boolean =>
  0 <= index && index < arr.length;
