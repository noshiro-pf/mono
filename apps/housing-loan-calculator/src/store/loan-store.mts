/**
 * The loan's inputs and what is calculated from them.
 *
 * The URL is the one place the inputs are kept: `deps.router` is read for them,
 * and every setter pushes a URL with the new value instead of holding it. So
 * the settings can be shared as a link, and the browser's back button undoes
 * one. The tests hand it a router over `createMemoryBrowser`.
 */

import {
  debounce,
  map,
  mapTo,
  merge,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import type { RouteNodeValues, Router } from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { defaultValues, routes, type Routes } from '../constants/index.mjs';
import { calcAll } from '../functions/index.mjs';
import type {
  BorrowingTotal,
  CalculatedValues,
  PercentFloat,
  RepaymentType,
  Store,
  Year,
} from '../types/index.mjs';

export type LoanDeps = Readonly<{
  router: Router<Routes>;
  /** How long the inputs have to stay still before they are calculated. */
  calcDelayMs: number;
}>;

export type LoanStore = Readonly<{
  inputs: InitializedObservable<Store>;
  calculatedValues: InitializedObservable<CalculatedValues>;
  /** Whether the inputs have changed since they were last calculated. */
  isCalculating: InitializedObservable<boolean>;
  setRepaymentType: (repaymentType: RepaymentType) => void;
  /** 借入金額（万円） */
  setBorrowingTotalManYen: (borrowingTotalManYen: BorrowingTotal) => void;
  /** 借入期間（年） */
  setBorrowingPeriodYear: (borrowingPeriodYear: Year) => void;
  /** 年当たりの金利 */
  setInterestRatePercentPerYear: (
    interestRatePercentPerYear: PercentFloat,
  ) => void;
}>;

export const createLoanStore = (deps: LoanDeps): LoanStore => {
  const inputs: InitializedObservable<Store> = deps.router
    .at(routes.loan)
    .pipe(map(storeFromPage));

  const calculatedValues = inputs
    .pipe(debounce(deps.calcDelayMs))
    .pipe(map(calcAll));

  const isCalculating: InitializedObservable<boolean> = merge([
    inputs.pipe(mapTo(true)),
    calculatedValues.pipe(mapTo(false)),
  ]).pipe(withInitialValue(false));

  const setInputs = (patch: Partial<Store>): void => {
    const next = {
      ...Optional.unwrap(inputs.getSnapshot()),
      ...patch,
    } as const;

    // The hash, and query parameters the page does not declare, are kept.
    deps.router.setSearch(routes.loan, () => ({
      'repayment-type': next.repaymentType,
      'borrowing-total': next.borrowingTotalManYen,
      'borrowing-period': next.borrowingPeriodYear,
      'interest-rate': next.interestRatePercentPerYear,
    }));
  };

  return {
    inputs,
    calculatedValues,
    isCalculating,
    setRepaymentType: (repaymentType) => {
      setInputs({ repaymentType });
    },
    setBorrowingTotalManYen: (borrowingTotalManYen) => {
      setInputs({ borrowingTotalManYen });
    },
    setBorrowingPeriodYear: (borrowingPeriodYear) => {
      setInputs({ borrowingPeriodYear });
    },
    setInterestRatePercentPerYear: (interestRatePercentPerYear) => {
      setInputs({ interestRatePercentPerYear });
    },
  };
};

/**
 * The URL is the one place the inputs are kept: what it says, and the default
 * for a value missing from it or not a valid one (which the route reads as
 * absent). So the same URL always shows the same inputs, and going back undoes
 * a change.
 */
const storeFromPage = (
  page: Optional<RouteNodeValues<Routes['loan']>>,
): Store => {
  if (Optional.isNone(page)) {
    return defaultValues;
  }

  const query = Optional.unwrap(page).search;

  return {
    repaymentType: query['repayment-type'] ?? defaultValues.repaymentType,
    borrowingTotalManYen:
      query['borrowing-total'] ?? defaultValues.borrowingTotalManYen,
    borrowingPeriodYear:
      query['borrowing-period'] ?? defaultValues.borrowingPeriodYear,
    interestRatePercentPerYear:
      query['interest-rate'] ?? defaultValues.interestRatePercentPerYear,
  };
};
