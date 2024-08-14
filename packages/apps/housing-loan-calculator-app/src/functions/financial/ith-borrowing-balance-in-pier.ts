import { type PercentFloat } from '../../types';

/**
 * 元利均等返済におけるi回支払い後の残高
 *
 * PIER = PrincipalAndInterestEqualRepayments
 */
export const ithBorrowingBalanceInPIER = ({
  total,
  numPayments: n,
  interestRate: r,
  ith: i,
}: Readonly<{
  total: number;
  numPayments: SafeUint;
  interestRate: PercentFloat;
  ith: SafeUint;
}>): number => {
  const q = 1 + r;
  return (
    total * Num.div(1 - q ** (i - n), toNonZeroFiniteNumber(1 - q ** (-1 * n)))
  );
};
