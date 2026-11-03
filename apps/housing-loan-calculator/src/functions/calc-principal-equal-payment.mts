import { Arr, Num, asPositiveSafeInt, type Uint32 } from 'ts-data-forge';
import { Yen, type PercentFloat } from '../types/index.mjs';

export const calcPrincipalEqualPayment = ({
  borrowingPeriodMonth: numPayments,
  borrowingTotalYen,
  interestRatePerMonth: interestRate,
}: Readonly<{
  borrowingPeriodMonth: Uint32;
  borrowingTotalYen: Yen;
  interestRatePerMonth: PercentFloat;
}>): Readonly<{
  fixedPrincipalYenPerMonth: Yen;
  borrowingBalanceYen: readonly Yen[];
  interestYen: readonly Yen[];
  monthlyPaymentTotalYen: readonly Yen[];
}> => {
  const fixedPrincipalYenPerMonth = Yen.cast(
    // TODO: `numPayments` を `Uint32` ではなく `PositiveSafeInt` 等の正の整数型にする
    Num.div(borrowingTotalYen, asPositiveSafeInt(numPayments)),
  );

  // The balance before each payment: one entry per payment (`CalculatedValues`).
  const borrowingBalanceYen = Arr.seq(numPayments).map((i) =>
    Yen.cast(borrowingTotalYen - i * fixedPrincipalYenPerMonth),
  );

  const interestYen = borrowingBalanceYen.map((b) =>
    Yen.cast(interestRate * b),
  );

  const monthlyPaymentTotalYen = interestYen.map((v) =>
    Yen.cast(v + fixedPrincipalYenPerMonth),
  );

  return {
    fixedPrincipalYenPerMonth,
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
  };
};
