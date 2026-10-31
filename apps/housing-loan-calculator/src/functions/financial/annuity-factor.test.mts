import { annuityFactor } from './annuity-factor.mjs';

describe(annuityFactor, () => {
  test('is 11.2551 for 12 payments at 1% a payment', () => {
    expect(annuityFactor(0.01, 12)).toBeCloseTo(11.255_077_5, 6);
  });

  // Around 1e-16, `1 + rate` stops being a different double from 1.
  test.each([0, Number.MIN_VALUE, 1e-17, 1.7e-16, 4e-16, 1e-12])(
    'is the count at a rate of %s, next to nothing',
    (rate) => {
      expect(annuityFactor(rate, 12)).toBeCloseTo(12, 6);
    },
  );
});
