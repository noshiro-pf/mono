/**
 * The positions in `values` of one longest strictly increasing subsequence, in
 * O(n log n). `For` keeps the rows at these positions in place and moves only
 * the others (SPEC.md 8.4).
 */
export const longestIncreasingSubsequence = (
  values: readonly number[],
): ReadonlySet<number> => {
  /** `tails[k]`: the position of the smallest tail of an increasing run of length k + 1. */
  const mut_tails: number[] = [];

  /** `previous[i]`: the position before `i` in the run that ends at `i`. */
  const mut_previous: (number | undefined)[] = [];

  for (const [i, value] of values.entries()) {
    const k = lowerBound(
      mut_tails,
      (position) => (values[position] ?? 0) < value,
    );

    mut_previous[i] = k > 0 ? mut_tails[k - 1] : undefined;

    mut_tails[k] = i;
  }

  const mut_result = new Set<number>();

  for (
    let mut_i = mut_tails.at(-1);
    mut_i !== undefined;
    mut_i = mut_previous[mut_i]
  ) {
    mut_result.add(mut_i);
  }

  return mut_result;
};

/** The first index of `sorted` for which `isBefore` is false. */
const lowerBound = (
  sorted: readonly number[],
  isBefore: (element: number) => boolean,
): number => {
  let mut_low = 0;

  let mut_high = sorted.length;

  while (mut_low < mut_high) {
    const middle = Math.floor((mut_low + mut_high) / 2);

    if (isBefore(sorted[middle] ?? 0)) {
      mut_low = middle + 1;
    } else {
      mut_high = middle;
    }
  }

  return mut_low;
};
