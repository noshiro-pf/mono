export const at = <T>(array: readonly T[], pos: number): T | undefined =>
  0 <= pos && pos < array.length ? array[pos] : undefined;
