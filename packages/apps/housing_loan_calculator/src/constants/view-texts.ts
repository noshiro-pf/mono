export const viewTexts = {
  appTitle: '住宅ローン返済シミュレーション（v0.2.0）',
  settings: '設定',
  numPayments: '支払い回数（回目）',
  borrowingBalanceYen: '借入残高（円）',
  borrowingTotalYen: '借入金額（＝物件の金額－頭金）',
  interestYen: '利息（円）',
  monthlyPaymentsYen: (unit: boolean): string =>
    `月々の支払額${unit ? '（円）' : ''}`,
  monthlyPrincipalPaymentsYen: (unit: boolean): string =>
    `月々の元金の支払い額${unit ? '（円）' : ''}`,
  interestSum: '利息合計額',
  paymentsSum: '合計支払額（＝頭金＋借入金額＋利息）',
  downPayment: '頭金（万円）',
  propertyPrice: '物件の金額（万円）',
  borrowingPeriodMonth: '借入期間（年）',
  interestRatePerMonth: '年利（％）',
  repaymentType: '返済方法',
  principalEqualPayment: '元金均等返済（月々の元金の返済額が定額）',
  principalAndInterestEqualRepayment: '元利均等返済（月々の合計返済額が定額）',
};
