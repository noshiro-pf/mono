export type CalculatedValues = DeepReadonly<{
  /** 借入残高（円） */
  borrowingBalanceYen: number[];
  /** 利息（円） */
  interestYen: number[];
  /** 月支払い額（円） */
  monthlyPaymentTotalYen: number[];
  /** 月々の元金支払い額（円） */
  monthlyPrincipalPaymentYen: number[];
  /** 元金の月額（円） */
  fixedPrincipalYenPerMonth: number;
  /** 月額 */
  fixedMonthlyPaymentsYen: number;
  /** 利息合計額 */
  interestSumManYen: number;
}>;
