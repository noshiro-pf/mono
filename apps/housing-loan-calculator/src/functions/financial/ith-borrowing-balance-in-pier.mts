import { Num, asPositiveFiniteNumber, type SafeUint } from 'ts-data-forge';
import type { PercentFloat } from '../../types/index.mjs';
import { annuityFactor } from './annuity-factor.mjs';

/**
 * 元利均等返済におけるi回支払い後の残高：残りの支払いの現在価値．金利 0 では
 * 元金が毎回同じ額ずつ減る．
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
}>): number =>
  total *
  Num.div(
    annuityFactor(interestRate, numPayments - ith),
    asPositiveFiniteNumber(annuityFactor(interestRate, numPayments)),
  );
