import type { StrictOmit } from 'ts-type-forge';
import { residentTaxRate } from '../../data/index.mjs';
import type { SalaryHistoryEntry } from '../input/index.mjs';
import {
  bonusHealthInsurancePremium,
  bonusWelfarePensionPremium,
  bonusWithholdingRate,
  employmentInsurancePremium,
  healthInsurancePremium,
  monthlyWithholdingTax,
  welfarePensionPremium,
} from '../tax/index.mjs';
import {
  findLatestStarted,
  monthOf,
  parseYearMonthOr,
  sortByStart,
  yearOf,
  type MonthIndex,
} from '../year-month/index.mjs';

/**
 * 給与・賞与の手取り額を月ごとに求める（`年収` シート）。
 *
 * - 月給（額面）は年収の推移の表から引き、退職する月（`retirementMonth`）の
 *   翌月から 0。賞与は毎年 1 月に支給する。
 * - 健康保険料・厚生年金保険料は、4〜6 月の月給（額面）の平均を標準報酬として
 *   その年の 9 月から翌年 8 月まで使う（定時決定）。賞与の分は等級を使わず、
 *   標準賞与額に料率を掛ける。
 * - 所得税は月額表、住民税は 12 か月前の月給からの概算。
 */
export const calculateSalary = (
  params: SalaryParams,
  months: readonly MonthIndex[],
): readonly SalaryMonth[] => {
  const salary = salaryLookup(params);

  return months.map((month) => calculateSalaryMonth(salary, month));
};

/** 年収の推移の 1 行から導出される値（`年収` シートの F, H 列）。 */
export const deriveSalaryEntry = (
  entry: SalaryHistoryEntry,
): DerivedSalaryEntry => {
  const monthlyGross = entry.annualBase / 12 - entry.companyDcMonthly;

  return {
    monthlyGross,
    annualIncome: monthlyGross * 12 + entry.annualBonus,
  };
};

/**
 * 年収の推移の表を開始月の昇順にして、各行の導出値を付けたもの。
 * 確定拠出年金と年金の計算もこれを使う。
 */
export const resolveSalaryHistory = (
  history: readonly SalaryHistoryEntry[],
  fallbackStart: MonthIndex,
): readonly ResolvedSalaryEntry[] =>
  sortByStart(
    history.map((entry) => ({
      ...entry,
      ...deriveSalaryEntry(entry),
      start: parseYearMonthOr(entry.start, fallbackStart),
    })),
  );

export type SalaryParams = Readonly<{
  history: readonly ResolvedSalaryEntry[];
  /** 最後に給与が出る月 */
  retirementMonth: MonthIndex;
}>;

export type DerivedSalaryEntry = Readonly<{
  /** 月収（額面）（円） */
  monthlyGross: number;
  /** 年収（賞与込み、企業型 DC の掛金を除く）（円） */
  annualIncome: number;
}>;

export type ResolvedSalaryEntry = Readonly<
  StrictOmit<SalaryHistoryEntry, 'start'> &
    DerivedSalaryEntry & { start: MonthIndex }
>;

export type SalaryMonth = Readonly<{
  month: MonthIndex;
  /** 月給（額面） */
  gross: number;
  /** 月給 - iDeCo */
  grossAfterIdeco: number;
  /** 賞与（額面） */
  bonus: number;
  healthInsurance: number;
  welfarePension: number;
  employmentInsurance: number;
  incomeTax: number;
  /** 住民税（概算） */
  residentTax: number;
  /** 月給手取り額 */
  net: number;
  bonusHealthInsurance: number;
  bonusWelfarePension: number;
  bonusEmploymentInsurance: number;
  bonusIncomeTax: number;
  /** 賞与手取り額 */
  bonusNet: number;
}>;

type SalaryLookup = Readonly<{
  entryAt: (month: MonthIndex) => ResolvedSalaryEntry | undefined;
  isEmployed: (month: MonthIndex) => boolean;
}>;

const salaryLookup = ({
  history,
  retirementMonth,
}: SalaryParams): SalaryLookup =>
  ({
    entryAt: (month) => findLatestStarted(history, month),
    isEmployed: (month) => month <= retirementMonth,
  }) as const;

const grossAt = (salary: SalaryLookup, month: MonthIndex): number =>
  salary.isEmployed(month) ? (salary.entryAt(month)?.monthlyGross ?? 0) : 0;

const grossAfterIdecoAt = (salary: SalaryLookup, month: MonthIndex): number => {
  if (!salary.isEmployed(month)) {
    return 0;
  }

  const entry = salary.entryAt(month);

  return entry === undefined ? 0 : entry.monthlyGross - entry.idecoMonthly;
};

/**
 * `month` に適用される標準報酬の元になる額: 9 月以降はその年の、8 月以前は
 * 前の年の 4〜6 月の月給（額面）の平均。
 */
const standardRemunerationBase = (
  salary: SalaryLookup,
  month: MonthIndex,
): number => {
  const year = monthOf(month) < 9 ? yearOf(month) - 1 : yearOf(month);

  const april = year * 12 + 3;

  const sum =
    grossAt(salary, april) +
    grossAt(salary, april + 1) +
    grossAt(salary, april + 2);

  return sum / 3;
};

const socialInsuranceAt = (
  salary: SalaryLookup,
  month: MonthIndex,
): Readonly<{
  healthInsurance: number;
  welfarePension: number;
  employmentInsurance: number;
}> => {
  const remuneration = standardRemunerationBase(salary, month);

  return {
    healthInsurance: healthInsurancePremium(remuneration),
    welfarePension: welfarePensionPremium(remuneration),
    employmentInsurance: employmentInsurancePremium(grossAt(salary, month)),
  };
};

/**
 * 住民税（月額）の概算。給与所得控除を 2〜3 割、基礎控除などを年 150 万円と
 * 見て、12 か月前の月給（iDeCo の掛金を除く）から求める。
 */
const residentTaxFrom = (grossAfterIdecoLastYear: number): number => {
  const ref = grossAfterIdecoLastYear;

  const employmentIncomeRatio = ref > 8_500_000 / 12 ? 0.8 : 0.7;

  return Math.max(
    0,
    (ref * employmentIncomeRatio - 1_500_000 / 12) * residentTaxRate,
  );
};

/**
 * 賞与の源泉徴収税額。ふつうは社会保険料等控除後の賞与に、前月の社会保険料等
 * 控除後の給与から算出率の表で引いた率を掛ける。ただし前月に給与が無いとき、
 * または賞与が前月の給与の 10 倍を超えるときは算出率の表を使わず、賞与の
 * 1/6（計算期間が 6 か月を超えるなら 1/12）を前月の給与に足して月額表に
 * 当てはめた税額から前月の給与の税額を引き、6 倍（12 倍）する。賞与は年に
 * 1 回なので、計算期間は 12 か月として 1/12 と 12 倍を使う。
 */
const bonusWithholdingTax = ({
  taxableBonus,
  hasPreviousSalary,
  previousAmount,
}: Readonly<{
  /** 社会保険料等控除後の賞与。 */
  taxableBonus: number;
  hasPreviousSalary: boolean;
  /** 前月の社会保険料等控除後の給与等の金額。 */
  previousAmount: number;
}>): number => {
  if (taxableBonus <= 0) {
    return 0;
  }

  if (hasPreviousSalary && taxableBonus <= previousAmount * 10) {
    return taxableBonus * bonusWithholdingRate(previousAmount);
  }

  const previous = hasPreviousSalary ? previousAmount : 0;

  return (
    (monthlyWithholdingTax(previous + taxableBonus / BONUS_PERIOD_MONTHS) -
      monthlyWithholdingTax(previous)) *
    BONUS_PERIOD_MONTHS
  );
};

/** 賞与の計算期間（月）。賞与は年に 1 回、1 月に支給する。 */
const BONUS_PERIOD_MONTHS = 12;

const calculateSalaryMonth = (
  salary: SalaryLookup,
  month: MonthIndex,
): SalaryMonth => {
  const gross = grossAt(salary, month);

  const grossAfterIdeco = grossAfterIdecoAt(salary, month);

  const { healthInsurance, welfarePension, employmentInsurance } =
    socialInsuranceAt(salary, month);

  const incomeTax = monthlyWithholdingTax(
    grossAfterIdeco - healthInsurance - welfarePension - employmentInsurance,
  );

  const residentTax = residentTaxFrom(grossAfterIdecoAt(salary, month - 12));

  const bonus =
    monthOf(month) === 1 && salary.isEmployed(month)
      ? (salary.entryAt(month)?.annualBonus ?? 0)
      : 0;

  const bonusHealthInsurance = bonusHealthInsurancePremium(bonus);

  const bonusWelfarePension = bonusWelfarePensionPremium(bonus);

  const bonusEmploymentInsurance = employmentInsurancePremium(bonus);

  const previous = socialInsuranceAt(salary, month - 1);

  const bonusIncomeTax = bonusWithholdingTax({
    taxableBonus:
      bonus -
      bonusHealthInsurance -
      bonusWelfarePension -
      bonusEmploymentInsurance,
    hasPreviousSalary: grossAt(salary, month - 1) > 0,
    // 算出率の表は「前月の社会保険料等控除後の給与等の金額」で引く。給与から
    // 天引きする iDeCo の掛金（小規模企業共済等掛金）も社会保険料等に入る
    // ので、月額表と同じく iDeCo の掛金を引いた額から引く。
    previousAmount:
      grossAfterIdecoAt(salary, month - 1) -
      previous.healthInsurance -
      previous.welfarePension -
      previous.employmentInsurance,
  });

  return {
    month,
    gross,
    grossAfterIdeco,
    bonus,
    healthInsurance,
    welfarePension,
    employmentInsurance,
    incomeTax,
    residentTax,
    net:
      grossAfterIdeco -
      (healthInsurance +
        welfarePension +
        employmentInsurance +
        incomeTax +
        residentTax),
    bonusHealthInsurance,
    bonusWelfarePension,
    bonusEmploymentInsurance,
    bonusIncomeTax,
    bonusNet:
      bonus -
      (bonusHealthInsurance +
        bonusWelfarePension +
        bonusEmploymentInsurance +
        bonusIncomeTax),
  };
};
