export const pick = (flag: boolean): number => {
  // @sumi-expect-error boolean/require-braces
  if (flag) return 1;

  return 0;
};
