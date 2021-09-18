import { IList } from '@noshiro/ts-utils';

export const calcPrincipalEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen: borrowingTotal,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: number;
  borrowingTotalYen: number;
  interestRatePerMonth: number;
}>): Readonly<{
  fixedPrincipalYenPerMonth: number;
  borrowingBalanceYen: readonly number[];
  interestYen: readonly number[];
  monthlyPaymentTotalYen: readonly number[];
}> => {
  const fixedPrincipalYenPerMonth = borrowingTotal / numPayments;

  const borrowingBalanceYen = IList.seqThrow(numPayments + 1).map(
    (i) => borrowingTotal - i * fixedPrincipalYenPerMonth
  );

  const interestYen = borrowingBalanceYen.map((b) => interestRate * b);
  const monthlyPaymentTotalYen = interestYen.map(
    (v) => v + fixedPrincipalYenPerMonth
  );

  return {
    fixedPrincipalYenPerMonth,
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
  };
};
