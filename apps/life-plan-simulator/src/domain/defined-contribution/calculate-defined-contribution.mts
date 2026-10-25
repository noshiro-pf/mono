import type { StrictOmit } from 'ts-type-forge';
import {
  definedContributionMaxAge,
  residentTaxRate,
  retirementIncomeDeduction,
} from '../../data/index.mjs';
import type { ResolvedSalaryEntry } from '../salary/index.mjs';
import { progressiveIncomeTax } from '../tax/index.mjs';
import {
  ageAt,
  findLatestStarted,
  isBirthdayMonth,
  monthOfAge,
  type MonthIndex,
} from '../year-month/index.mjs';

/**
 * 確定拠出年金（企業型 DC と iDeCo）の評価額と受取額を月ごとに求める
 * （`確定拠出型年金` シート）。
 *
 * - 掛金は年収の推移の表の企業型 DC と iDeCo の合計で、60 歳か退職年齢の
 *   早いほうになる月から 0。
 * - 一括受給の年齢になる月に残高をすべて受け取り、退職所得として課税する。
 *   それより前の 60〜64 歳・65〜68 歳の誕生月には年ごとの額を受け取る。
 */
export const calculateDefinedContribution = (
  params: DefinedContributionParams,
  months: readonly MonthIndex[],
): DefinedContributionResult => {
  const {
    birth,
    salaryHistory,
    retirementAge,
    lumpSumAge,
    joinedAt,
    initialValue,
    monthlyYield,
    installmentAge60To64,
    installmentAge65To68,
  } = params;

  const contributionEnd = monthOfAge(
    birth,
    Math.min(definedContributionMaxAge, retirementAge),
  );

  const lumpSumMonth = monthOfAge(birth, lumpSumAge);

  let mut_value = initialValue;

  let mut_lumpSumGross = 0;

  const mut_rows: StrictOmit<DefinedContributionMonth, 'received'>[] = [];

  for (const month of months) {
    const entry = findLatestStarted(salaryHistory, month);

    const contribution =
      entry !== undefined && month < contributionEnd
        ? entry.companyDcMonthly + entry.idecoMonthly
        : 0;

    const age = ageAt(month, birth);

    const withdrawal = !isBirthdayMonth(month, birth)
      ? 0
      : month === lumpSumMonth
        ? mut_value
        : month > lumpSumMonth
          ? 0
          : Math.min(
              mut_value,
              60 <= age && age <= 64
                ? installmentAge60To64
                : 65 <= age && age <= 68
                  ? installmentAge65To68
                  : 0,
            );

    if (month === lumpSumMonth) {
      mut_lumpSumGross = withdrawal;
    }

    mut_value = (mut_value + contribution - withdrawal) * (1 + monthlyYield);

    mut_rows.push({
      month,
      contribution,
      withdrawal,
      value: month < lumpSumMonth ? mut_value : 0,
    });
  }

  const lumpSum = lumpSumTax(
    mut_lumpSumGross,
    Math.ceil((contributionEnd - joinedAt) / 12),
  );

  return {
    lumpSumMonth,
    lumpSum,
    months: mut_rows.map((row) => ({
      ...row,
      received: row.month === lumpSumMonth ? lumpSum.afterTax : row.withdrawal,
    })),
  };
};

/** 一括受給額にかかる退職所得の税金（所得税・住民税）。 */
export const lumpSumTax = (
  gross: number,
  years: number,
): DefinedContributionLumpSum => {
  const y = Math.max(0, years);

  const deduction = Math.max(
    retirementIncomeDeduction.minimum,
    Math.min(20, y) * retirementIncomeDeduction.perYearUpTo20 +
      Math.max(0, y - 20) * retirementIncomeDeduction.perYearOver20,
  );

  const taxable = Math.max(
    0,
    Math.floor((gross - deduction) / 2 / 1000) * 1000,
  );

  const tax = progressiveIncomeTax(taxable) + taxable * residentTaxRate;

  return {
    gross,
    years: y,
    deduction,
    taxable,
    tax,
    afterTax: gross - tax,
  };
};

export type DefinedContributionParams = Readonly<{
  birth: MonthIndex;
  salaryHistory: readonly ResolvedSalaryEntry[];
  retirementAge: number;
  lumpSumAge: number;
  joinedAt: MonthIndex;
  /** シミュレーション開始時点の評価額 */
  initialValue: number;
  /** 運用利回り（月率） */
  monthlyYield: number;
  installmentAge60To64: number;
  installmentAge65To68: number;
}>;

export type DefinedContributionResult = Readonly<{
  lumpSumMonth: MonthIndex;
  lumpSum: DefinedContributionLumpSum;
  months: readonly DefinedContributionMonth[];
}>;

export type DefinedContributionLumpSum = Readonly<{
  /** 一括受取額（税引き前） */
  gross: number;
  /** 勤続年数（加入年数） */
  years: number;
  /** 退職所得控除 */
  deduction: number;
  /** 課税退職所得金額 */
  taxable: number;
  /** 所得税・住民税 */
  tax: number;
  /** 一括受取額（税引き後） */
  afterTax: number;
}>;

export type DefinedContributionMonth = Readonly<{
  month: MonthIndex;
  /** 掛金 */
  contribution: number;
  /** 取り崩し額 */
  withdrawal: number;
  /** 受取額（課税後） */
  received: number;
  /** 月末の評価額（一括受給した月からは 0） */
  value: number;
}>;
