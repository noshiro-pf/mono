import {
  accumulationFactor,
  annuityFactor,
  periodRateOf,
} from './compound-interest.mjs';

// Around 1e-16, `1 + rate` stops being a different double from 1, so these
// rates are where a formula written as it reads cancels.
const tinyRates = [0, Number.MIN_VALUE, 1e-17, 1.7e-16, 4e-16, 1e-12] as const;

describe(annuityFactor, () => {
  test('is 11.2551 for 12 payments at 1% a payment', () => {
    expect(annuityFactor(0.01, 12)).toBeCloseTo(11.255_077_5, 6);
  });

  test.each(tinyRates)('is the count at a rate of %s, next to nothing', (rate) => {
    expect(annuityFactor(rate, 12)).toBeCloseTo(12, 6);
  });
});

describe(accumulationFactor, () => {
  test('is 12.6825 for 12 payments at 1% a payment', () => {
    expect(accumulationFactor(0.01, 12)).toBeCloseTo(12.682_503, 6);
  });

  test.each(tinyRates)('is the count at a rate of %s, next to nothing', (rate) => {
    expect(accumulationFactor(rate, 10)).toBeCloseTo(10, 6);
  });
});

describe(periodRateOf, () => {
  test('splits 12.68% a year into 1% a month', () => {
    expect(periodRateOf(1.01 ** 12 - 1, 12)).toBeCloseTo(0.01, 12);
  });

  test('is 0 at a rate of 0', () => {
    expect(periodRateOf(0, 12)).toBe(0);
  });

  test.each([1e-17, 1.7e-16, 4e-16, 1e-12])(
    'keeps its relative precision at a rate of %s',
    (rate) => {
      // At a tiny rate, splitting into k periods is division by k.
      expect(periodRateOf(rate, 12) / (rate / 12)).toBeCloseTo(1, 9);
    },
  );
});
