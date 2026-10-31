import { Arr, asPositiveUint32, asUint32 } from 'ts-data-forge';
import { variance } from './variance.mjs';

describe(variance, () => {
  test('returns undefined for an empty list', () => {
    expect(variance([])).toBeUndefined();
  });

  test('returns the population variance', () => {
    expect(variance([1, 2, 3, 4])).toBe(1.25);

    expect(variance([5])).toBe(0);
  });

  test('returns about 0, never a negative value, for a constant list', () => {
    // The mean of equal values can differ from them in the last bit, so the
    // result is a tiny non-negative number rather than exactly 0.
    for (const x of [
      3.363_964_751_345_322,
      0.1,
      ...Arr.seq(asUint32(1000)).map((i) => i / 7 + 0.1),
    ]) {
      for (const n of [2, 3, 7]) {
        const v = variance(Arr.create(asPositiveUint32(n), x));

        expect(v).toBeGreaterThanOrEqual(0);

        expect(v).toBeCloseTo(0, 10);
      }
    }
  });

  test('is accurate for a nearly constant list far from 0', () => {
    expect(variance([1e9 + 1, 1e9 + 2, 1e9 + 3])).toBeCloseTo(2 / 3, 6);
  });
});
