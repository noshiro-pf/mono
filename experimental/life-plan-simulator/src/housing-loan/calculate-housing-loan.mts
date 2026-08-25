import { Num } from 'ts-data-forge';
import { type HousingLoanParams, type MonthlyPaymentResult } from './types.mjs';

/**
 * 等額返済額を計算（元利均等返済）
 * @param principal 元金
 * @param monthlyRate 月利
 * @param numberOfPayments 返済回数
 * @returns 毎月の返済額
 */
const calculateFixedMonthlyPayment = (
  principal: number,
  monthlyRate: number,
  numberOfPayments: number,
): number => {
  if (monthlyRate === 0) {
    if (!Num.isNonZero(numberOfPayments)) return 0;

    return Num.div(principal, numberOfPayments);
  }

  const r = monthlyRate;

  const n = numberOfPayments;

  const denominator = (1 + r) ** n - 1;

  if (!Num.isNonZero(denominator)) return 0;

  return Num.div(principal * r * (1 + r) ** n, denominator);
};

/**
 * 住宅ローンの返済スケジュールを計算
 */
export const calculateHousingLoan = (
  params: HousingLoanParams,
): readonly MonthlyPaymentResult[] => {
  const {
    principalAmount,
    loanTermYears,
    initialAnnualRate,
    monthlyRateIncrease,
    maxAnnualRate,
  } = params;

  const totalMonths = loanTermYears * 12;

  const mut_results: MonthlyPaymentResult[] = [];

  let mut_remainingBalance = principalAmount;

  let mut_currentAnnualRate = initialAnnualRate;

  for (let mut_month = 1; mut_month <= totalMonths; mut_month++) {
    // 金利の更新（1ヶ月ごとに上昇）
    if (mut_month > 1) {
      mut_currentAnnualRate = Math.min(
        mut_currentAnnualRate + monthlyRateIncrease,
        maxAnnualRate,
      );
    }

    // 年利を月利に変換
    const currentMonthlyRate = mut_currentAnnualRate / 12;

    // 残りの返済回数
    const remainingPayments = totalMonths - mut_month + 1;

    // 今月の返済額を計算（月利を使用）
    const paymentAmount = calculateFixedMonthlyPayment(
      mut_remainingBalance,
      currentMonthlyRate,
      remainingPayments,
    );

    // 利息部分（月利を使用）
    const interestPayment = mut_remainingBalance * currentMonthlyRate;

    // 元金返済部分
    const principalPayment = paymentAmount - interestPayment;

    // 残高更新
    mut_remainingBalance -= principalPayment;

    mut_results.push({
      month: mut_month,
      appliedAnnualRate: mut_currentAnnualRate,
      paymentAmount,
      remainingBalance: mut_remainingBalance,
    });
  }

  return mut_results;
};
