import { normalizeBounded } from './normalize-bounded.mjs';

describe(normalizeBounded, () => {
  const toYear = normalizeBounded({ min: 1, max: 100, integer: true });

  const toRate = normalizeBounded({ min: 0, max: 100, integer: false });

  test.each([
    [35, 35],
    [35.4, 35],
    [35.5, 36],
  ] as const)('rounds for `integer`: %d → %d', (n, expected) => {
    assert.strictEqual(toYear(n), expected);
  });

  test.each([
    [0, 1],
    [-3, 1],
    [5_000_000_000, 100],
  ] as const)('clamps to the range: %d → %d', (n, expected) => {
    assert.strictEqual(toYear(n), expected);
  });

  test.each([
    [-0.1, 0],
    [120, 100],
  ] as const)(
    'clamps to the range without rounding: %d → %d',
    (n, expected) => {
      assert.strictEqual(toRate(n), expected);
    },
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'commits min for %d, a number that is not finite',
    (n) => {
      assert.strictEqual(toYear(n), 1);

      assert.strictEqual(toRate(n), 0);
    },
  );

  test('keeps a number in range', () => {
    assert.strictEqual(toRate(0.5), 0.5);
  });
});
