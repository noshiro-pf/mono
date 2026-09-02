import { Num, asPositiveFiniteNumber, type SafeUint } from 'ts-data-forge';
import { type PercentFloat } from '../../types/index.mjs';

/**
 * 元利均等返済における月々の支払い額を求める計算式．
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
  total *
  interestRate *
  (1 +
    Num.div(1, asPositiveFiniteNumber((1 + interestRate) ** numPayments - 1)));
