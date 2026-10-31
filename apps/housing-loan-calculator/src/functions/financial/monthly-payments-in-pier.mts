import { Num, asPositiveFiniteNumber, type SafeUint } from 'ts-data-forge';
import type { PercentFloat } from '../../types/index.mjs';
import { annuityFactor } from './annuity-factor.mjs';

/**
 * 元利均等返済における月々の支払い額を求める計算式．金利 0 では総額を回数で
 * 割った額になる．
 *
 * PIER = PrincipalAndInterestEqualRepayments
 */
export const monthlyPaymentsInPIER = ({
  total,
  numPayments,
  interestRate,
}: Readonly<{
  total: number;
  numPayments: SafeUint;
  interestRate: PercentFloat;
}>): number =>
  Num.div(
    total,
    asPositiveFiniteNumber(annuityFactor(interestRate, numPayments)),
  );
