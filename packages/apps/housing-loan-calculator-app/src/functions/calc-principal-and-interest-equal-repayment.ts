import { toYen, type PercentFloat, type Yen } from '../types';
import { ithBorrowingBalanceInPIER, monthlyPaymentsInPIER } from './financial';

export const calcPrincipalAndInterestEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: SafeUint;
  borrowingTotalYen: Yen;
  interestRatePerMonth: PercentFloat;
}>): Readonly<{
  borrowingBalanceYen: readonly Yen[];
  interestYen: readonly Yen[];
  monthlyPrincipalPaymentYen: readonly Yen[];
  fixedMonthlyPaymentsYen: Yen;
}> => {
  const fixedMonthlyPaymentsYen = toYen(
    monthlyPaymentsInPIER({
      total: borrowingTotalYen,
      numPayments,
      interestRate,
    }),
  );

  const borrowingBalanceYen = Arr.seq(SafeUint.add(numPayments, 1)).map((ith) =>
    toYen(
      ithBorrowingBalanceInPIER({
        total: borrowingTotalYen,
        numPayments,
        interestRate,
        ith,
      }),
    ),
  );

  const interestYen = borrowingBalanceYen.map((b) => toYen(interestRate * b));

  const monthlyPrincipalPaymentYen = interestYen.map((v) =>
    toYen(fixedMonthlyPaymentsYen - v),
  );

  return {
    borrowingBalanceYen,
    interestYen,
    monthlyPrincipalPaymentYen,
    fixedMonthlyPaymentsYen,
  };
};
