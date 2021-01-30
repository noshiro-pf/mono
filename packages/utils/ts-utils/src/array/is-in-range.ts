export const indexIsInRange = <T>(array: readonly T[]) => (
  index: number
): boolean => 0 <= index && index < array.length;
