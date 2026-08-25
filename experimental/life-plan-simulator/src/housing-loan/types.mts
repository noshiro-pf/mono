export type HousingLoanParams = Readonly<{
  /** 借入額（円） */
  principalAmount: number;
  /** 返済年数（年） */
  loanTermYears: number;
  /** 初期金利（年利、例: 0.007 = 年利0.7%） */
  initialAnnualRate: number;
  /** 5年毎の金利上昇率（年利） */
  rateIncreaseEvery5Years: number;
  /** 1か月の金利上昇率（年利） */
  monthlyRateIncrease: number;
  /** 最大金利（年利） */
  maxAnnualRate: number;
}>;

export type MonthlyPaymentResult = Readonly<{
  /** 月番号（1から開始） */
  month: number;
  /** 適用金利（年利） */
  appliedAnnualRate: number;
  /** 返済額（円） */
  paymentAmount: number;
  /** 残高（円） */
  remainingBalance: number;
}>;
