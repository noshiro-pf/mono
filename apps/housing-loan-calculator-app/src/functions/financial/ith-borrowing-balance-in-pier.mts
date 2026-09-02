import { Num, asNonZeroFiniteNumber, type SafeUint } from 'ts-data-forge';
import { type PercentFloat } from '../../types/index.mjs';

/**
 * 元利均等返済におけるi回支払い後の残高
 *
 * PIER = PrincipalAndInterestEqualRepayments
 */
export const ithBorrowingBalanceInPIER = ({
  total,
  numPayments,
  interestRate,
  ith,
}: Readonly<{
  total: number;
  numPayments: SafeUint;
  interestRate: PercentFloat;
  ith: SafeUint;
}>): number => {
  const q = 1 + interestRate;

  // Widened before negating: `no-unsafe-unary-minus` rejects a unary minus on
  // a branded integer, and `lint:fix` rewrites the `-1 * numPayments` the
  // source used back into that unary form.
  const exponent: number = numPayments;

  return (
    total *
    Num.div(
      1 - q ** (ith - numPayments),
      asNonZeroFiniteNumber(1 - q ** -exponent),
    )
  );
};
