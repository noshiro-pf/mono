import type { uint32 } from '@noshiro/ts-utils';
import { seq } from '@noshiro/ts-utils';

export const calcPrincipalEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen: borrowingTotal,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: number;
  borrowingTotalYen: number;
  interestRatePerMonth: number;
}>): {
  fixedPrincipalYenPerMonth: number;
  borrowingBalanceYen: number[];
  interestYen: number[];
  monthlyPaymentTotalYen: number[];
} => {
  const fixedPrincipalYenPerMonth = borrowingTotal / numPayments;

  const borrowingBalanceYen = seq((numPayments + 1) as uint32).map(
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
