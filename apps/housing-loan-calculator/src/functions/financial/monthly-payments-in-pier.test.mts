import { asSafeUint } from 'ts-data-forge';
import { PercentFloat } from '../../types/index.mjs';
import { monthlyPaymentsInPIER } from './monthly-payments-in-pier.mjs';

describe(monthlyPaymentsInPIER, () => {
  test('pays 1,200,000 at 1% a month over 12 months in 106,618.55 a month', () => {
    expect(
      monthlyPaymentsInPIER({
        total: 1_200_000,
        numPayments: asSafeUint(12),
        interestRate: PercentFloat.cast(0.01),
      }),
    ).toBeCloseTo(106_618.55, 2);
  });

  // Around 1e-16 a month, `1 + rate` stops being a different double from 1.
  test.each([0, 1e-17, 1.7e-16, 4e-16, 1e-12])(
    'pays a twelfth a month at a monthly rate of %s, next to nothing',
    (rate) => {
      expect(
        monthlyPaymentsInPIER({
          total: 12_000_000,
          numPayments: asSafeUint(12),
          interestRate: PercentFloat.cast(rate),
        }),
      ).toBeCloseTo(1_000_000, 2);
    },
  );
});
