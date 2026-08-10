import { type Yen } from './yen';

export type CalculatedValues = DeepReadonly<{
  /** 借入残高（円） */
  borrowingBalanceYen: Yen[];
  /** 利息（円） */
  interestYen: Yen[];
  /** 月支払い額（円） */
  monthlyPaymentTotalYen: Yen[];
  /** 月々の元金支払い額（円） */
  monthlyPrincipalPaymentYen: Yen[];
  /** 元金の月額（円） */
  fixedPrincipalYenPerMonth: Yen;
  /** 月額 */
  fixedMonthlyPaymentsYen: Yen;
  /** 利息合計額 */
  interestSumManYen: Yen;
}>;
