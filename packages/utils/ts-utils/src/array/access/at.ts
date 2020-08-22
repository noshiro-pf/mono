export const at = <T>(array: readonly T[], pos: number): T | undefined => {
  if (pos < 0 || array.length <= pos) return undefined;
  return array[pos];
};
