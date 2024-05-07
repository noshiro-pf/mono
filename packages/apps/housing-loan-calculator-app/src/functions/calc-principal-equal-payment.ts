import { toYen, type PercentFloat, type Yen } from '../types';

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
  const fixedPrincipalYenPerMonth = toYen(borrowingTotalYen / numPayments);

  const borrowingBalanceYen = Arr.seq(Uint32.add(numPayments, 1)).map((i) =>
    toYen(borrowingTotalYen - i * fixedPrincipalYenPerMonth),
  );

  const interestYen = borrowingBalanceYen.map((b) => toYen(interestRate * b));

  const monthlyPaymentTotalYen = interestYen.map((v) =>
    toYen(v + fixedPrincipalYenPerMonth),
  );

  return {
    fixedPrincipalYenPerMonth,
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
  };
};
