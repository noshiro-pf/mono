export const sum = (xs: readonly number[]): number => {
  let mut_total = 0;

  // @sumi-expect-error boolean/require-braces
  for (const x of xs) mut_total += x;

  return mut_total;
};
