import type { uint32 } from '@noshiro/ts-utils';
import { seq } from '@noshiro/ts-utils';
import { ithBorrowingBalanceInPIER, monthlyPaymentsInPIER } from './financial';

export const calcPrincipalAndInterestEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen: borrowingTotal,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: number;
  borrowingTotalYen: number;
  interestRatePerMonth: number;
}>): {
  borrowingBalanceYen: number[];
  interestYen: number[];
  monthlyPrincipalPaymentYen: number[];
  fixedMonthlyPaymentsYen: number;
} => {
  const fixedMonthlyPaymentsYen = monthlyPaymentsInPIER({
    total: borrowingTotal,
    numPayments,
    interestRate,
  });

  const borrowingBalanceYen = seq((numPayments + 1) as uint32).map((ith) =>
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
