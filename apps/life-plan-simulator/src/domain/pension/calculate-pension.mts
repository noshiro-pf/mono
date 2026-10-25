import { Arr, Num } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import {
  basicPensionFullAmount,
  basicPensionFullMonths,
  incomeTaxBasicDeduction,
  pensionBreakEvenMaxAge,
  pensionDeferralIncreasePerMonth,
  pensionEarlyReductionPerMonth,
  pensionSocialInsuranceRate,
  pensionStartAgeMax,
  pensionStartAgeMin,
  residentTaxBasicDeduction,
  residentTaxPerCapita,
  residentTaxRate,
  welfarePensionAnnualIncomeCap,
  welfarePensionCoefficient,
  welfarePensionCountFromAge,
} from '../../data/index.mjs';
import type { ResolvedSalaryEntry } from '../salary/index.mjs';
import { progressiveIncomeTax, publicPensionDeduction } from '../tax/index.mjs';
import { ageAt, integerRange, type MonthIndex } from '../year-month/index.mjs';

/**
 * 年金の受給額と手取りを受給開始年齢ごとに求める（`年金受給額` シート）。
 *
 * - 老齢厚生年金（報酬比例部分）は 平均年収 × 乗率 × 加入年数。年収は
 *   年収の推移の表から年齢ごとに引き、上限で頭打ちにする。
 * - 受給開始年齢ごとに繰上げ・繰下げの増減率を掛け、公的年金等控除・
 *   社会保険料（概算）・所得税・住民税を引いて手取りにする。
 * - 損益分岐: 各年齢までの手取りの累計（老後の運用利回りで複利運用した
 *   とき）が、どの受給開始年齢で最大になるかを比べ、その受給開始年齢が
 *   最大である最後の年齢を「何歳まで得か」とする。
 */
export const calculatePension = (params: PensionParams): PensionResult => {
  const {
    birth,
    salaryHistory,
    retirementAge,
    basicPensionMonths,
    yieldRetired,
  } = params;

  const countedAges = integerRange(
    welfarePensionCountFromAge,
    Math.max(welfarePensionCountFromAge, Math.floor(retirementAge) + 1),
  );

  const incomes = countedAges
    .map((age) =>
      Math.min(
        welfarePensionAnnualIncomeCap,
        annualIncomeAtAge(salaryHistory, birth, age),
      ),
    )
    .filter((income) => income > 0);

  const enrolledYears = incomes.length;

  const averageAnnualIncome = Num.isNonZero(enrolledYears)
    ? Num.div(Arr.sum(incomes), enrolledYears)
    : 0;

  const welfarePension =
    averageAnnualIncome * welfarePensionCoefficient * enrolledYears;

  const basicPension =
    (basicPensionFullAmount *
      Math.min(basicPensionMonths, basicPensionFullMonths)) /
    basicPensionFullMonths;

  const annualAt65 = welfarePension + basicPension;

  const byStartAge = integerRange(
    pensionStartAgeMin,
    pensionStartAgeMax + 1,
  ).map((startAge) => pensionForStartAge(annualAt65, startAge));

  const breakEvenAges = breakEven(byStartAge, yieldRetired);

  return {
    enrolledYears,
    averageAnnualIncome,
    welfarePension,
    basicPension,
    annualAt65,
    byStartAge: byStartAge.map((row, i) => ({
      ...row,
      lastAgeBest: breakEvenAges[i],
    })),
  };
};

/** 受給開始年齢 `startAge` の年間手取り額（範囲外なら 60 / 75 歳に寄せる）。 */
export const annualNetPensionFor = (
  pension: PensionResult,
  startAge: number,
): number => {
  const age = Math.min(
    pensionStartAgeMax,
    Math.max(pensionStartAgeMin, Math.floor(startAge)),
  );

  return pension.byStartAge.find((row) => row.startAge === age)?.net ?? 0;
};

export type PensionParams = Readonly<{
  birth: MonthIndex;
  salaryHistory: readonly ResolvedSalaryEntry[];
  retirementAge: number;
  basicPensionMonths: number;
  /** 損益分岐の計算で手取りを運用する利回り（年率） */
  yieldRetired: number;
}>;

export type PensionResult = Readonly<{
  /** 厚生年金の加入年数 */
  enrolledYears: number;
  /** 平均年収（円） */
  averageAnnualIncome: number;
  /** 老齢厚生年金（報酬比例部分）（円 / 年） */
  welfarePension: number;
  /** 老齢基礎年金（円 / 年） */
  basicPension: number;
  /** 65 歳から受給する場合の年金額（円 / 年） */
  annualAt65: number;
  byStartAge: readonly PensionByStartAge[];
}>;

export type PensionByStartAge = Readonly<{
  startAge: number;
  /** 受給額（円 / 年） */
  gross: number;
  /** 公的年金等控除額 */
  deduction: number;
  /** 社会保険料（概算） */
  socialInsurance: number;
  incomeTax: number;
  residentTax: number;
  /** 年間手取り額 */
  net: number;
  /** この受給開始年齢がほかより得である最後の年齢。どの年齢でも得でなければ `undefined` */
  lastAgeBest: number | undefined;
}>;

/** 満 `age` 歳の時点で適用されている年収の推移の行の年収（無ければ 0）。 */
const annualIncomeAtAge = (
  history: readonly ResolvedSalaryEntry[],
  birth: MonthIndex,
  age: number,
): number => {
  let mut_income = 0;

  for (const entry of history) {
    if (ageAt(entry.start, birth) > age) {
      break;
    }

    mut_income = entry.annualIncome;
  }

  return mut_income;
};

const pensionForStartAge = (
  annualAt65: number,
  startAge: number,
): StrictOmit<PensionByStartAge, 'lastAgeBest'> => {
  const monthsFrom65 = (startAge - 65) * 12;

  const factor =
    monthsFrom65 < 0
      ? 1 + monthsFrom65 * pensionEarlyReductionPerMonth
      : 1 + monthsFrom65 * pensionDeferralIncreasePerMonth;

  const gross = annualAt65 * factor;

  const deduction = publicPensionDeduction(gross, startAge >= 65);

  const socialInsurance = gross * pensionSocialInsuranceRate;

  const income = gross - deduction - socialInsurance;

  const incomeTax = progressiveIncomeTax(
    Math.max(0, income - incomeTaxBasicDeduction),
  );

  const residentTaxable = Math.max(0, income - residentTaxBasicDeduction);

  const residentTax =
    residentTaxable > 0
      ? residentTaxable * residentTaxRate + residentTaxPerCapita
      : 0;

  return {
    startAge,
    gross,
    deduction,
    socialInsurance,
    incomeTax,
    residentTax,
    net: gross - socialInsurance - incomeTax - residentTax,
  };
};

const breakEven = (
  rows: readonly Readonly<{ startAge: number; net: number }>[],
  rate: number,
): readonly (number | undefined)[] => {
  const ages = integerRange(pensionStartAgeMin, pensionBreakEvenMaxAge + 1);

  const cumulative = (row: (typeof rows)[number], age: number): number => {
    const n = age - row.startAge + 1;

    return n <= 0
      ? 0
      : Num.isNonZero(rate)
        ? Num.div(row.net * ((1 + rate) ** n - 1), rate)
        : row.net * n;
  };

  const mut_lastBest: (number | undefined)[] = rows.map(() => undefined);

  for (const age of ages) {
    const values = rows.map((row) => cumulative(row, age));

    const best = Math.max(...values);

    for (const [i, value] of values.entries()) {
      if (value === best && best > 0) {
        mut_lastBest[i] = age;
      }
    }
  }

  return mut_lastBest;
};
