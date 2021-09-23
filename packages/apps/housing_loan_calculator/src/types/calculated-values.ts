export type CalculatedValues = DeepReadonly<{
  borrowingBalanceYen: number[]; // 借入残高（円）
  interestYen: number[]; // 利息（円）
  monthlyPaymentTotalYen: number[]; // 月支払い額（円）
  monthlyPrincipalPaymentYen: number[]; // 月々の元金支払額（円）
  fixedPrincipalYenPerMonth: number; // 元金の月額（円）
  fixedMonthlyPaymentsYen: number; // 月額
  interestSumManYen: number; // 利息合計額
}>;
