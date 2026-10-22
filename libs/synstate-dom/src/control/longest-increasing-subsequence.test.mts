import { longestIncreasingSubsequence } from './longest-increasing-subsequence.mjs';

describe(longestIncreasingSubsequence, () => {
  test.each([
    { values: [], expected: [] },
    { values: [0, 1, 2], expected: [0, 1, 2] },
    { values: [2, 1, 0], expected: [2] },
    { values: [1, 2, 0], expected: [0, 1] },
    { values: [3, 0, 1, 2], expected: [1, 2, 3] },
    { values: [0, 8, 4, 12, 2, 10, 6, 14, 1, 9], expected: [0, 2, 5, 9] },
  ])('$values', ({ values, expected }) => {
    const result = longestIncreasingSubsequence(values);

    assert.strictEqual(result.size, expected.length);

    const picked = Array.from(result).toSorted((a, b) => a - b);

    assert.isTrue(
      picked.every(
        (position, k) =>
          k === 0 ||
          (values[position] ?? 0) > (values[picked[k - 1] ?? 0] ?? 0),
      ),
    );
  });
});
