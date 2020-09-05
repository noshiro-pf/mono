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
}: {
  total: number;
  numPayments: number;
  interestRate: number;
  ith: number;
}): number => {
  const q = 1 + r;
  return total * ((1 - q ** (i - n)) / (1 - q ** -n));
};
