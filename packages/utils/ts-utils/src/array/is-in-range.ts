export const indexIsInRange = <T>(index: number) => (
  array: readonly T[]
): boolean => 0 <= index && index < array.length;
