/**
 * The indices of `positions` on one longest strictly increasing subsequence, in
 * O(n log n). A negative entry (a row that is new) takes no part. `For` keeps
 * the rows at these indices in place and moves only the others.
 */
export const longestIncreasingRun = (
  positions: readonly number[],
): ReadonlySet<number> => {
  /** `tails[k]`: the index of the smallest tail of a run of length k + 1. */
  const mut_tails: number[] = [];

  /** `previous[i]`: the index before `i` in the run that ends at `i`. */
  const mut_previous: (number | undefined)[] = [];

  for (const [i, position] of positions.entries()) {
    if (position < 0) {
      continue;
    }

    const k = lowerBound(
      mut_tails,
      (index) => (positions[index] ?? 0) < position,
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- in range
    if (isBefore(sorted[middle]!)) {
      mut_low = middle + 1;
    } else {
      mut_high = middle;
    }
  }

  return mut_low;
};

if (import.meta.vitest !== undefined) {
  describe('longestIncreasingRun', () => {
    test('skips new rows and keeps one longest run', () => {
      assert.deepStrictEqual(
        Array.from(longestIncreasingRun([2, -1, 0, 1, -1, 3])).toSorted(
          (a, b) => a - b,
        ),
        [2, 3, 5],
      );
    });

    test('an empty list', () => {
      assert.strictEqual(longestIncreasingRun([]).size, 0);
    });
  });
}
