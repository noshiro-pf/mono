/**
 * @description
 * 元利均等返済における月々の支払額を求める計算式．
 * PIER = PrincipalAndInterestEqualRepayments
 */
export const monthlyPaymentsInPIER = ({
  total,
  numPayments: n,
  interestRate: r,
}: Readonly<{
  total: number;
  numPayments: number;
  interestRate: number;
}>): number => total * r * (1 + 1 / ((1 + r) ** n - 1));
