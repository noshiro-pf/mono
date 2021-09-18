import { IList } from '@noshiro/ts-utils';
import { ithBorrowingBalanceInPIER, monthlyPaymentsInPIER } from './financial';

export const calcPrincipalAndInterestEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen: borrowingTotal,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: number;
  borrowingTotalYen: number;
  interestRatePerMonth: number;
}>): Readonly<{
  borrowingBalanceYen: readonly number[];
  interestYen: readonly number[];
  monthlyPrincipalPaymentYen: readonly number[];
  fixedMonthlyPaymentsYen: number;
}> => {
  const fixedMonthlyPaymentsYen = monthlyPaymentsInPIER({
    total: borrowingTotal,
    numPayments,
    interestRate,
  });

  const borrowingBalanceYen = IList.seqThrow(numPayments + 1).map((ith) =>
    ithBorrowingBalanceInPIER({
      total: borrowingTotal,
      numPayments,
      interestRate,
      ith,
    })
  );

  const interestYen = borrowingBalanceYen.map((b) => interestRate * b);

  const monthlyPrincipalPaymentYen = interestYen.map(
    (v) => fixedMonthlyPaymentsYen - v
  );

  return {
    borrowingBalanceYen,
    interestYen,
    monthlyPrincipalPaymentYen,
    fixedMonthlyPaymentsYen,
  };
};
