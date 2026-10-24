import { Arr } from 'ts-data-forge';
import type { MonthlyPaymentResult } from './types.mjs';

/**
 * 返済スケジュールを画面に出す要約値にまとめる。
 * スケジュールが空（返済年数 0 など）のときはすべて 0。
 */
export const summarizeHousingLoan = (
  schedule: readonly MonthlyPaymentResult[],
): HousingLoanSummary => {
  if (!Arr.isNonEmpty(schedule)) {
    return { firstPayment: 0, maxPayment: 0, totalPayment: 0 };
  }

  const payments = schedule.map((p) => p.paymentAmount);

  return {
    firstPayment: schedule[0].paymentAmount,
    maxPayment: Math.max(...payments),
    totalPayment: Arr.sum(payments),
  };
};

export type HousingLoanSummary = Readonly<{
  /** 初回の返済額（円） */
  firstPayment: number;
  /** 最大の返済額（円） */
  maxPayment: number;
  /** 総返済額（円） */
  totalPayment: number;
}>;
