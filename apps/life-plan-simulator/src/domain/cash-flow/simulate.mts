import { Arr } from 'ts-data-forge';
import { capitalGainsTaxRate, nisaLifetimeLimit } from '../../data/index.mjs';
import {
  calculateDefinedContribution,
  type DefinedContributionResult,
} from '../defined-contribution/index.mjs';
import {
  calculateHousingLoan,
  calculateHousingLoanDeduction,
  housingLoanDeductionConditions,
  monthlyRateIncreaseFrom5Years,
  type HousingLoanDeduction,
  type MonthlyPaymentResult,
} from '../housing-loan/index.mjs';
import type { SimulationInput } from '../input/index.mjs';
import {
  calculateInvestmentAccount,
  resolveOneOffs,
  toMonthlyRate,
  type InvestmentAccountMonth,
} from '../investment/index.mjs';
import {
  annualNetPensionFor,
  calculatePension,
  type PensionResult,
} from '../pension/index.mjs';
import {
  calculateSalary,
  resolveSalaryHistory,
  type SalaryMonth,
} from '../salary/index.mjs';
import {
  ageAt,
  integerRange,
  monthOfAge,
  parseYearMonth,
  parseYearMonthOr,
  type MonthIndex,
} from '../year-month/index.mjs';

/**
 * 入力値から各シートの計算をすべて行い、月ごとの収支と現預金の残高を求める
 * （`収支` シート）。
 *
 * 現預金の増減 = 収入合計 - 支出合計 - 積立 NISA の投資額 + 取崩額
 * - 投信（課税枠）の投資額 + 受取額（課税後）。
 */
export const simulate = (input: SimulationInput): SimulationResult => {
  const { profile, assumptions } = input;

  const birth = parseYearMonthOr(profile.birth, defaultBirth);

  const start = parseYearMonthOr(profile.start, defaultStart);

  const end = Math.max(start, monthOfAge(birth, profile.endAge + 1) - 1);

  const months = integerRange(start, end + 1);

  const retirementMonth = monthOfAge(birth, assumptions.retirementAge);

  const salaryHistory = resolveSalaryHistory(input.salaryHistory, start);

  const salary = calculateSalary(
    { history: salaryHistory, retirementMonth },
    months,
  );

  const pension = calculatePension({
    birth,
    salaryHistory,
    retirementAge: assumptions.retirementAge,
    basicPensionMonths: input.pension.basicPensionMonths,
    yieldRetired: assumptions.yieldRetired,
  });

  const monthlyPension =
    annualNetPensionFor(pension, assumptions.pensionStartAge) / 12;

  const pensionStartMonth = monthOfAge(birth, assumptions.pensionStartAge);

  const definedContribution = calculateDefinedContribution(
    {
      birth,
      salaryHistory,
      retirementAge: assumptions.retirementAge,
      lumpSumAge: assumptions.dcLumpSumAge,
      joinedAt: parseYearMonthOr(input.definedContribution.joinedAt, start),
      initialValue: input.definedContribution.initialValue,
      monthlyYield: toMonthlyRate(assumptions.yieldWorking),
      installmentAge60To64: input.definedContribution.installmentAge60To64,
      installmentAge65To68: input.definedContribution.installmentAge65To68,
    },
    months,
  );

  const lumpSumAfterTax = definedContribution.lumpSum.afterTax;

  const lumpSumToNisa = Math.min(
    lumpSumAfterTax,
    input.definedContribution.lumpSumToNisa,
  );

  const lumpSumToTaxable = input.definedContribution.lumpSumRestToTaxable
    ? lumpSumAfterTax - lumpSumToNisa
    : 0;

  const yieldSwitchMonth = monthOfAge(birth, assumptions.yieldSwitchAge);

  const monthlyYieldWorking = toMonthlyRate(assumptions.yieldWorking);

  const monthlyYieldRetired = toMonthlyRate(assumptions.yieldRetired);

  const monthlyYieldAt = (month: MonthIndex): number =>
    month < yieldSwitchMonth ? monthlyYieldWorking : monthlyYieldRetired;

  const nisa = calculateInvestmentAccount(
    {
      input: input.nisa,
      monthlyYieldAt,
      extraContributionAt: (month) =>
        month === definedContribution.lumpSumMonth ? lumpSumToNisa : 0,
      taxRate: 0,
    },
    months,
  );

  const taxableInvestment = calculateInvestmentAccount(
    {
      input: input.taxableInvestment,
      monthlyYieldAt,
      extraContributionAt: (month) =>
        month === definedContribution.lumpSumMonth ? lumpSumToTaxable : 0,
      taxRate: capitalGainsTaxRate,
    },
    months,
  );

  const housingLoan = simulateHousingLoan(input.housingLoan, start);

  const oneOffIncomes = resolveOneOffs(input.oneOffIncomes);

  const oneOffExpenses = resolveOneOffs(input.oneOffExpenses);

  const oldNisaSale = oldNisaSaleOf(input, assumptions.yieldWorking, start);

  const rentUntil = parseYearMonthOr(input.rent.until, start);

  const livingCostBase = Arr.sum(input.livingCosts.map((c) => c.monthly));

  const periodicExpenses = input.periodicExpenses.map((e) => ({
    amount: e.amount,
    interval: Math.max(1, Math.round(e.intervalYears)) * 12,
    first: parseYearMonthOr(e.first, start),
    until: parseYearMonthOr(e.until, start),
  }));

  const loanPayments = new Map(
    housingLoan.schedule.map((p) => [housingLoan.start + p.month - 1, p]),
  );

  const loanDeductions = new Map(
    housingLoan.deductions.map((d) => [d.month, d.amount]),
  );

  let mut_cash = assumptions.initialCash;

  const mut_rows: CashFlowMonth[] = [];

  for (const [i, month] of months.entries()) {
    const s = salary[i];

    const n = nisa[i];

    const ti = taxableInvestment[i];

    const dc = definedContribution.months[i];

    if (
      s === undefined ||
      n === undefined ||
      ti === undefined ||
      dc === undefined
    ) {
      break;
    }

    const income = {
      salaryNet: s.net,
      bonusNet: s.bonusNet,
      oneOffIncome: oneOffIncomes.get(month) ?? 0,
      oldNisaSale:
        month === oldNisaSale?.month ? oldNisaSale.amount : (0 as const),
      pension: month >= pensionStartMonth ? monthlyPension : (0 as const),
      definedContribution: dc.received,
      housingLoanDeduction: loanDeductions.get(month) ?? 0,
    } as const;

    const periodic = periodicExpenses.map((e) =>
      e.first <= month &&
      month < e.until &&
      (month - e.first) % e.interval === 0
        ? e.amount
        : 0,
    );

    const expense = {
      rent: month < rentUntil ? input.rent.monthly : (0 as const),
      housingLoan: loanPayments.get(month)?.paymentAmount ?? 0,
      livingCost:
        livingCostBase *
        (1 + assumptions.livingCostInflationRate) ** ((month - start) / 12),
      periodic: Arr.sum(periodic),
      oneOffExpense: oneOffExpenses.get(month) ?? 0,
    } as const;

    const totalIncome = Arr.sum(Object.values(income));

    const totalExpense = Arr.sum(Object.values(expense));

    const cashChange =
      totalIncome -
      totalExpense -
      n.contribution +
      n.withdrawal -
      ti.contribution +
      ti.received;

    mut_cash += cashChange;

    mut_rows.push({
      month,
      age: ageAt(month, birth),
      ...income,
      totalIncome,
      ...expense,
      periodicItems: periodic,
      totalExpense,
      balanceExcludingInvestment: totalIncome - totalExpense,
      nisaContribution: n.contribution,
      nisaWithdrawal: n.withdrawal,
      nisaValue: n.value,
      taxableContribution: ti.contribution,
      taxableReceived: ti.received,
      taxableValue: ti.value,
      definedContributionValue: dc.value,
      cashChange,
      cash: mut_cash,
    });
  }

  const thresholdFrom = parseYearMonthOr(
    assumptions.cashThresholdCheckFrom,
    start,
  );

  return {
    birth,
    start,
    retirementMonth,
    rows: mut_rows,
    salary,
    pension,
    definedContribution,
    nisa,
    taxableInvestment,
    housingLoan,
    checks: {
      cashNonNegative: firstFailing(mut_rows, (r) => r.cash >= 0),
      cashAboveThreshold: firstFailing(
        mut_rows,
        (r) => r.month < thresholdFrom || r.cash >= assumptions.cashThreshold,
      ),
      nisaNonNegative: firstFailing(nisa, (r) => r.value >= 0),
      taxableNonNegative: firstFailing(taxableInvestment, (r) => r.value >= 0),
      nisaWithinLifetimeLimit: firstFailing(
        nisa,
        (r) => r.usedQuota <= nisaLifetimeLimit,
      ),
    },
  };
};

export type SimulationResult = Readonly<{
  birth: MonthIndex;
  start: MonthIndex;
  /** 最後に給与が出る月 */
  retirementMonth: MonthIndex;
  rows: readonly CashFlowMonth[];
  salary: readonly SalaryMonth[];
  pension: PensionResult;
  definedContribution: DefinedContributionResult;
  nisa: readonly InvestmentAccountMonth[];
  taxableInvestment: readonly InvestmentAccountMonth[];
  housingLoan: HousingLoanSimulation;
  /** 判定ごとに、条件を満たさない最初の月（すべて満たせば `undefined`） */
  checks: Readonly<{
    cashNonNegative: MonthIndex | undefined;
    cashAboveThreshold: MonthIndex | undefined;
    nisaNonNegative: MonthIndex | undefined;
    taxableNonNegative: MonthIndex | undefined;
    nisaWithinLifetimeLimit: MonthIndex | undefined;
  }>;
}>;

export type HousingLoanSimulation = Readonly<{
  start: MonthIndex;
  schedule: readonly MonthlyPaymentResult[];
  deductions: readonly HousingLoanDeduction[];
}>;

export type CashFlowMonth = Readonly<{
  month: MonthIndex;
  age: number;
  /** 月給 - (税金 + 社会保険料) */
  salaryNet: number;
  /** 賞与 - (税金 + 社会保険料) */
  bonusNet: number;
  oneOffIncome: number;
  oldNisaSale: number;
  /** 年金 - (税金 + 社会保険料) */
  pension: number;
  /** 確定拠出年金の受取額 */
  definedContribution: number;
  housingLoanDeduction: number;
  totalIncome: number;
  rent: number;
  housingLoan: number;
  /** 日常生活費（物価上昇込み） */
  livingCost: number;
  /** 何年かおきの支出の合計 */
  periodic: number;
  /** 何年かおきの支出の内訳（入力の並び順） */
  periodicItems: readonly number[];
  oneOffExpense: number;
  totalExpense: number;
  /** 資産運用以外の収支 */
  balanceExcludingInvestment: number;
  nisaContribution: number;
  nisaWithdrawal: number;
  nisaValue: number;
  taxableContribution: number;
  /** 投信（課税枠）の受取額（課税後） */
  taxableReceived: number;
  taxableValue: number;
  definedContributionValue: number;
  /** 現預金の増減 */
  cashChange: number;
  /** 月末の現預金の額 */
  cash: number;
}>;

const defaultBirth = 1990 * 12 + 3;

const defaultStart = 2026 * 12;

const simulateHousingLoan = (
  loan: SimulationInput['housingLoan'],
  fallbackStart: MonthIndex,
): HousingLoanSimulation => {
  const start = parseYearMonthOr(loan.start, fallbackStart);

  if (loan.principal <= 0 || loan.termYears <= 0) {
    return { start, schedule: [], deductions: [] };
  }

  const schedule = calculateHousingLoan({
    principalAmount: loan.principal,
    loanTermYears: Math.round(loan.termYears),
    initialAnnualRate: loan.initialRate,
    rateIncreaseEvery5Years: loan.rateIncreasePer5Years,
    monthlyRateIncrease: monthlyRateIncreaseFrom5Years(
      loan.rateIncreasePer5Years,
    ),
    maxAnnualRate: loan.maxRate,
  });

  return {
    start,
    schedule,
    deductions: calculateHousingLoanDeduction(
      schedule,
      start,
      housingLoanDeductionConditions(loan),
    ),
  };
};

/** 旧つみたて NISA を売った月と額（購入から売却まで現役時代の利回りで増える）。 */
const oldNisaSaleOf = (
  input: SimulationInput,
  yieldWorking: number,
  fallback: MonthIndex,
): Readonly<{ month: MonthIndex; amount: number }> | undefined => {
  const { amount, purchasedAt, sellAt } = input.oldNisa;

  const month = parseYearMonth(sellAt);

  if (amount === 0 || month === undefined) {
    return undefined;
  }

  const years = (month - parseYearMonthOr(purchasedAt, fallback)) / 12;

  return { month, amount: amount * (1 + yieldWorking) ** years };
};

const firstFailing = <R extends Readonly<{ month: MonthIndex }>>(
  rows: readonly R[],
  ok: (row: R) => boolean,
): MonthIndex | undefined => rows.find((row) => !ok(row))?.month;
