import type { DeepReadonly } from 'ts-type-forge';
import type { Yen } from './yen.mjs';

/**
 * Each array has one entry per payment, in order. `monthlyPaymentTotalYen` is
 * always the 元金均等返済 schedule and `monthlyPrincipalPaymentYen` always the
 * 元利均等返済 one; the balance and the interest follow `repaymentType`.
 */
export type CalculatedValues = DeepReadonly<{
  /** 借入残高（円）: the balance before each payment */
  borrowingBalanceYen: Yen[];
  /** 利息（円） */
  interestYen: Yen[];
  /** 月支払い額（円）: 元金均等返済 */
  monthlyPaymentTotalYen: Yen[];
  /** 月々の元金支払い額（円）: 元利均等返済 */
  monthlyPrincipalPaymentYen: Yen[];
  /** 元金の月額（円） */
  fixedPrincipalYenPerMonth: Yen;
  /** 月額 */
  fixedMonthlyPaymentsYen: Yen;
  /** 利息合計額 */
  interestSumManYen: Yen;
}>;
