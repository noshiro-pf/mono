import { type PercentFloat, Yen } from '../types';

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
    Num.div(borrowingTotalYen, toPositiveSafeInt(numPayments)),
  );

  const borrowingBalanceYen = Arr.seq(Uint32.add(numPayments, 1)).map((i) =>
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
