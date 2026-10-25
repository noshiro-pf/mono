import { Num } from 'ts-data-forge';
import type {
  InvestmentAccountInput,
  MonthlyAmountFrom,
  OneOffAmount,
} from '../input/index.mjs';
import {
  findLatestStarted,
  parseYearMonth,
  parseYearMonthOr,
  sortByStart,
  type MonthIndex,
} from '../year-month/index.mjs';

/**
 * 投資口座の評価額・元金・取り崩し額を月ごとに求める（`積立NISA` /
 * `投信（課税枠）` シート）。
 *
 * - 毎月、前月末の評価額に投資額を足して取崩額を引き、その月の運用利回り
 *   （年率を月率に直したもの）で増やす。
 * - 取崩額のうち利益の割合（前月末の 1 - 元金 / 評価額）が利益、残りが元金。
 *   課税口座では利益に `taxRate` を掛けた分を引いて受け取る。
 * - 生涯投資枠（NISA）の利用額は 投資額の累計 - 取り崩した元金の累計。
 */
export const calculateInvestmentAccount = (
  params: InvestmentAccountParams,
  months: readonly MonthIndex[],
): readonly InvestmentAccountMonth[] => {
  const { input, monthlyYieldAt, extraContributionAt, taxRate } = params;

  const fallback = months[0] ?? 0;

  const regularContributions = resolveSteps(
    input.regularContributions,
    fallback,
  );

  const regularWithdrawals = resolveSteps(input.regularWithdrawals, fallback);

  const oneOffContributions = resolveOneOffs(input.oneOffContributions);

  const oneOffWithdrawals = resolveOneOffs(input.oneOffWithdrawals);

  let mut_value = input.initialValue;

  let mut_principal = input.initialPrincipal;

  let mut_usedQuota = input.initialUsedQuota;

  let mut_profitRatio = profitRatioOf(mut_value, mut_principal);

  const mut_rows: InvestmentAccountMonth[] = [];

  for (const month of months) {
    const contribution =
      (findLatestStarted(regularContributions, month)?.amount ?? 0) +
      (oneOffContributions.get(month) ?? 0) +
      extraContributionAt(month);

    const withdrawal =
      (findLatestStarted(regularWithdrawals, month)?.amount ?? 0) +
      (oneOffWithdrawals.get(month) ?? 0);

    const profitInWithdrawal = withdrawal * mut_profitRatio;

    const principalInWithdrawal = withdrawal - profitInWithdrawal;

    mut_value =
      (mut_value + contribution - withdrawal) * (1 + monthlyYieldAt(month));

    mut_principal = mut_principal + contribution - principalInWithdrawal;

    mut_usedQuota = mut_usedQuota + contribution - principalInWithdrawal;

    mut_profitRatio = profitRatioOf(mut_value, mut_principal);

    mut_rows.push({
      month,
      contribution,
      withdrawal,
      value: mut_value,
      principal: mut_principal,
      profitRatio: mut_profitRatio,
      profitInWithdrawal,
      principalInWithdrawal,
      received: withdrawal - profitInWithdrawal * taxRate,
      usedQuota: mut_usedQuota,
    });
  }

  return mut_rows;
};

/** 年率の利回りを月率にする（複利）。 */
export const toMonthlyRate = (annualRate: number): number =>
  (1 + annualRate) ** (1 / 12) - 1;

export type InvestmentAccountParams = Readonly<{
  input: InvestmentAccountInput;
  /** その月の運用利回り（月率） */
  monthlyYieldAt: (month: MonthIndex) => number;
  /** 入力値以外にその月に入れる額（確定拠出年金の一括受給額など） */
  extraContributionAt: (month: MonthIndex) => number;
  /** 取崩額に含まれる利益にかかる税率（NISA は 0） */
  taxRate: number;
}>;

export type InvestmentAccountMonth = Readonly<{
  month: MonthIndex;
  /** 投資額 */
  contribution: number;
  /** 取り崩し額 */
  withdrawal: number;
  /** 月末の評価額 */
  value: number;
  /** 月末の元金総額 */
  principal: number;
  /** 月末の評価額に占める利益の割合 */
  profitRatio: number;
  /** 取崩額に含まれる利益額 */
  profitInWithdrawal: number;
  /** 取崩額に含まれる元金額 */
  principalInWithdrawal: number;
  /** 受取額（課税後） */
  received: number;
  /** 生涯投資枠の利用額 */
  usedQuota: number;
}>;

const profitRatioOf = (value: number, principal: number): number =>
  Num.isNonZero(value) ? 1 - Num.div(principal, value) : 0;

const resolveSteps = (
  steps: readonly MonthlyAmountFrom[],
  fallback: MonthIndex,
): readonly Readonly<{ start: MonthIndex; amount: number }>[] =>
  sortByStart(
    steps.map((s) => ({
      start: parseYearMonthOr(s.start, fallback),
      amount: s.amount,
    })),
  );

/** 一回きりの金額を年月ごとに合計する。年月が読めない行は無視する。 */
export const resolveOneOffs = (
  items: readonly OneOffAmount[],
): ReadonlyMap<MonthIndex, number> => {
  const mut_map = new Map<MonthIndex, number>();

  for (const item of items) {
    const month = parseYearMonth(item.month);

    if (month !== undefined) {
      mut_map.set(month, (mut_map.get(month) ?? 0) + item.amount);
    }
  }

  return mut_map;
};
