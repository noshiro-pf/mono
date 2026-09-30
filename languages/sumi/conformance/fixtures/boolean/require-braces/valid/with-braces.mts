export const sum = (flag: boolean, xs: readonly number[]): number => {
  if (!flag) {
    return 0;
  }

  let mut_total = 0;

  for (const x of xs) {
    mut_total += x;
  }

  return mut_total;
};
