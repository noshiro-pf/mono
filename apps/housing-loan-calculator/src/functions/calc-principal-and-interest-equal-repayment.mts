import { Arr, type Uint32 } from 'ts-data-forge';
import { type PercentFloat, Yen } from '../types/index.mjs';
import {
  ithBorrowingBalanceInPIER,
  monthlyPaymentsInPIER,
} from './financial/index.mjs';

export const calcPrincipalAndInterestEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: Uint32;
  borrowingTotalYen: Yen;
  interestRatePerMonth: PercentFloat;
}>): Readonly<{
  borrowingBalanceYen: readonly Yen[];
  interestYen: readonly Yen[];
  monthlyPrincipalPaymentYen: readonly Yen[];
  fixedMonthlyPaymentsYen: Yen;
}> => {
  const fixedMonthlyPaymentsYen = Yen.cast(
    monthlyPaymentsInPIER({
      total: borrowingTotalYen,
      numPayments,
      interestRate,
    }),
  );

  // The balance before each payment: one entry per payment (`CalculatedValues`).
  const borrowingBalanceYen = Arr.seq(numPayments).map((ith) =>
    Yen.cast(
      ithBorrowingBalanceInPIER({
        total: borrowingTotalYen,
        numPayments,
        interestRate,
        ith,
      }),
    ),
  );

  const interestYen = borrowingBalanceYen.map((b) =>
    Yen.cast(interestRate * b),
  );

  const monthlyPrincipalPaymentYen = interestYen.map((v) =>
    Yen.cast(fixedMonthlyPaymentsYen - v),
  );

  return {
    borrowingBalanceYen,
    interestYen,
    monthlyPrincipalPaymentYen,
    fixedMonthlyPaymentsYen,
  };
};
