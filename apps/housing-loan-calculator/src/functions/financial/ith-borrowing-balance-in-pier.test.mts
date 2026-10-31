import { asSafeUint } from 'ts-data-forge';
import { PercentFloat } from '../../types/index.mjs';
import { ithBorrowingBalanceInPIER } from './ith-borrowing-balance-in-pier.mjs';

const balance = (rate: number, ith: number): number =>
  ithBorrowingBalanceInPIER({
    total: 1_200_000,
    numPayments: asSafeUint(12),
    interestRate: PercentFloat.cast(rate),
    ith: asSafeUint(ith),
  });

describe(ithBorrowingBalanceInPIER, () => {
  test('owes 617,905.28 after 6 of 12 payments at 1% a month', () => {
    expect(balance(0.01, 6)).toBeCloseTo(617_905.28, 2);
  });

  test.each([0.01, 1.7e-16, 0])(
    'owes the whole total before the first payment and nothing after the last, at a monthly rate of %s',
    (rate) => {
      expect(balance(rate, 0)).toBeCloseTo(1_200_000, 6);

      expect(balance(rate, 12)).toBeCloseTo(0, 6);
    },
  );

  test.each([0, 1e-17, 1.7e-16, 4e-16])(
    'owes half after 6 of 12 payments at a monthly rate of %s, next to nothing',
    (rate) => {
      expect(balance(rate, 6)).toBeCloseTo(600_000, 2);
    },
  );
});
