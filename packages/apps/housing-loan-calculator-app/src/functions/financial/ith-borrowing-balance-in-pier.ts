import { type PercentFloat } from '../../types';

/**
 * @description
 * 元利均等返済におけるi回支払い後の残高
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
  return total * ((1 - q ** (i - n)) / (1 - q ** -n));
};
