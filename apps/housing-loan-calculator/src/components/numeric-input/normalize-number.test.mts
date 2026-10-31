import { normalizeNumber } from './normalize-number.mjs';

describe(normalizeNumber, () => {
  const toYear = normalizeNumber({ fallback: 1, integer: true });

  const toRate = normalizeNumber({ fallback: 0, integer: false });

  test.each([
    [35, 35],
    [35.4, 35],
    [35.5, 36],
  ] as const)('rounds for `integer`: %d → %d', (n, expected) => {
    assert.strictEqual(toYear(n), expected);
  });

  test('keeps a number without rounding when not `integer`', () => {
    assert.strictEqual(toRate(0.5), 0.5);
  });

  test('commits the fallback for NaN, the number of text that is no number', () => {
    assert.strictEqual(toYear(Number.NaN), 1);

    assert.strictEqual(toRate(Number.NaN), 0);
  });
});
