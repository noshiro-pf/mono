import { Arr, Num } from 'ts-data-forge';
import type { Cells } from '../scenario.mjs';

/**
 * The loan every implementation under this directory renders: a fixed-rate loan
 * repaid monthly over {@link months} months, with a prepayment that can be
 * entered for any month. The screen shows one row per year and a summary.
 *
 * Month by month,
 *
 * - `interest[k] = balance[k - 1] × monthlyRate`,
 * - `repaid[k] = min(balance[k - 1], payment − interest[k] + prepayment[k])`,
 * - `balance[k] = balance[k - 1] − repaid[k]`,
 *
 * so the balance of one month reaches the next month's balance by three paths
 * of different lengths, and the diamonds are chained {@link months} deep. The
 * monthly rate and the payment enter every month, which adds diamonds that span
 * the whole chain.
 *
 * The signal-based implementations make one derived value per figure, so that
 * the graph is as large as the calculation; React and Preact compute the
 * figures in a loop when they render. Every implementation computes each figure
 * with the functions below, in the same order, so that they all render the same
 * digits.
 */
export type LoanApp = Readonly<{
  /** The annual interest rate, in percent. */
  setAnnualRate: (percent: number) => void;
  /** The prepayment in `month` (from 0), on top of the monthly payment. */
  setPrepayment: (month: number, amount: number) => void;
  dispose: () => void;
}>;

export type LoanInputs = Readonly<{
  principal: number;
  annualRate: number;
  /** One per month, 0 for none. */
  prepayments: readonly number[];
}>;

/** 30 years. */
export const months = 360;

export const years = months / 12;

export const initialInputs: LoanInputs = {
  principal: 30_000_000,
  annualRate: 1.5,
  prepayments: Array.from({ length: months }, () => 0),
} as const;

export const monthlyRateOf = (annualRate: number): number => annualRate / 1200;

/** The fixed monthly payment that repays `principal` in {@link months}. */
export const paymentOf = (principal: number, monthlyRate: number): number => {
  const denominator = 1 - (1 + monthlyRate) ** -months;

  // The denominator is 0 only when the rate is: then the principal is simply
  // split evenly.
  return Num.isNonZero(denominator)
    ? Num.div(principal * monthlyRate, denominator)
    : principal / months;
};

export const interestOf = (balance: number, monthlyRate: number): number =>
  balance * monthlyRate;

export const repaidOf = (
  balance: number,
  interest: number,
  payment: number,
  prepayment: number,
): number => Math.min(balance, payment - interest + prepayment);

export const balanceOf = (balance: number, repaid: number): number =>
  balance - repaid;

/** Left to right, so that every implementation rounds the same way. */
export const sumOf = (values: readonly number[]): number => Arr.sum(values);

/** The months until the balance first reaches 0, or {@link months}. */
export const repaymentMonthsOf = (balances: readonly number[]): number => {
  const index = balances.findIndex((balance) => balance <= 0);

  return index === -1 ? months : index + 1;
};

/** Every figure is shown in whole yen. */
export const yen = (amount: number): string => Math.round(amount).toString();

/** The cells of the summary row: payment, total interest, months to repay. */
export const loanSummaryCells = (
  payment: number,
  totalInterest: number,
  repaymentMonths: number,
): readonly string[] =>
  [yen(payment), yen(totalInterest), repaymentMonths.toString()] as const;

/** The cells of a year's row: the year, interest, repaid, closing balance. */
export const yearCells = (
  year: number,
  interest: number,
  repaid: number,
  balance: number,
): readonly string[] =>
  [(year + 1).toString(), yen(interest), yen(repaid), yen(balance)] as const;

/**
 * Every figure, computed in one loop over the months: what React and Preact do
 * when they render, and what the harness checks the others against.
 */
export const computeLoan = (inputs: LoanInputs): Cells => {
  const monthlyRate = monthlyRateOf(inputs.annualRate);

  const payment = paymentOf(inputs.principal, monthlyRate);

  const mut_interests: number[] = [];

  const mut_repaid: number[] = [];

  const mut_balances: number[] = [];

  for (const month of Array.from({ length: months }, (_, k) => k)) {
    const opening = mut_balances.at(-1) ?? inputs.principal;

    const interest = interestOf(opening, monthlyRate);

    const repaid = repaidOf(
      opening,
      interest,
      payment,
      inputs.prepayments[month] ?? 0,
    );

    mut_interests.push(interest);

    mut_repaid.push(repaid);

    mut_balances.push(balanceOf(opening, repaid));
  }

  const yearRows = Array.from({ length: years }, (_, year) => {
    const ofYear = (values: readonly number[]): readonly number[] =>
      values.slice(year * 12, year * 12 + 12);

    return {
      interest: sumOf(ofYear(mut_interests)),
      repaid: sumOf(ofYear(mut_repaid)),
      balance: mut_balances[year * 12 + 11] ?? 0,
    } as const;
  });

  return Arr.toUnshifted(
    loanSummaryCells(
      payment,
      sumOf(yearRows.map((row) => row.interest)),
      repaymentMonthsOf(mut_balances),
    ),
  )(
    yearRows.map((row, year) =>
      yearCells(year, row.interest, row.repaid, row.balance),
    ),
  );
};

/** The months of a year (from 0), as indices into the monthly figures. */
export const monthsOfYear = (year: number): readonly number[] =>
  Array.from({ length: 12 }, (_, i) => year * 12 + i);
