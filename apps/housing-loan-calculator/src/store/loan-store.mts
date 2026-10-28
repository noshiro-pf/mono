/**
 * The loan's inputs and what is calculated from them.
 *
 * The URL is the one place the inputs are kept: `deps.router` is read for
 * them, and every setter pushes a URL with the new value instead of holding
 * it. So the settings can be shared as a link, and the browser's back button
 * undoes one. The tests hand it a router over `createMemoryBrowser`.
 */

import {
  debounce,
  map,
  mapTo,
  merge,
  scan,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import type { Router, RouterState } from 'tiny-router-observable';
import { Num, pipe } from 'ts-data-forge';
import { defaultValues, queryParamKey } from '../constants/index.mjs';
import { calcAll } from '../functions/index.mjs';
import {
  PercentFloat,
  Year,
  Yen,
  type CalculatedValues,
  type RepaymentType,
  type Store,
} from '../types/index.mjs';
import { uriWithQueryParams } from '../utils/index.mjs';

export type LoanDeps = Readonly<{
  router: Router;
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
  setBorrowingTotalManYen: (borrowingTotalManYen: Yen) => void;
  /** 借入期間（年） */
  setBorrowingPeriodYear: (borrowingPeriodYear: Year) => void;
  /** 年当たりの金利 */
  setInterestRatePercentPerYear: (
    interestRatePercentPerYear: PercentFloat,
  ) => void;
}>;

export const createLoanStore = (deps: LoanDeps): LoanStore => {
  const inputs: InitializedObservable<Store> = deps.router.state.pipe(
    scan(
      storeFromQuery,
      storeFromQuery(defaultValues, deps.router.state.getSnapshot().value),
    ),
  );

  const calculatedValues = inputs
    .pipe(debounce(deps.calcDelayMs))
    .pipe(map(calcAll));

  const isCalculating: InitializedObservable<boolean> = merge([
    inputs.pipe(mapTo(true)),
    calculatedValues.pipe(mapTo(false)),
  ]).pipe(withInitialValue(false));

  const setInputs = (patch: Partial<Store>): void => {
    const next = { ...inputs.getSnapshot().value, ...patch } as const;

    deps.router.push(
      uriWithQueryParams('/', [
        [queryParamKey.repaymentType, next.repaymentType],
        [queryParamKey.borrowingTotal, next.borrowingTotalManYen],
        [queryParamKey.borrowingPeriodMonth, next.borrowingPeriodYear],
        [queryParamKey.interestRatePerMonth, next.interestRatePercentPerYear],
      ]),
    );
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
 * The URL is the one place the inputs are kept: a value missing from it, or
 * not a valid one, stays as it was.
 */
const storeFromQuery = (
  prev: Store,
  { searchParams: query }: RouterState,
): Store => {
  const paramsAsStr = {
    repaymentType: query.get(queryParamKey.repaymentType),
    borrowingTotal: query.get(queryParamKey.borrowingTotal),
    borrowingPeriodMonth: query.get(queryParamKey.borrowingPeriodMonth),
    interestRatePerMonth: query.get(queryParamKey.interestRatePerMonth),
  } as const;

  // `mapNullable` is the old `mapOptional`; `URLSearchParams.get` returns
  // `null` rather than `undefined`, which it covers too.
  const paramsAsNumber = {
    borrowingTotal: pipe(paramsAsStr.borrowingTotal).mapNullable(Num.from)
      .value,
    borrowingPeriodMonth: pipe(paramsAsStr.borrowingPeriodMonth).mapNullable(
      Num.from,
    ).value,
    interestRatePerMonth: pipe(paramsAsStr.interestRatePerMonth).mapNullable(
      Num.from,
    ).value,
  } as const;

  return {
    repaymentType:
      paramsAsStr.repaymentType === 'principal-and-interest-equal-repayment' ||
      paramsAsStr.repaymentType === 'principal-equal-payment'
        ? paramsAsStr.repaymentType
        : prev.repaymentType,
    borrowingTotalManYen:
      paramsAsNumber.borrowingTotal === undefined
        ? prev.borrowingTotalManYen
        : Yen.cast(paramsAsNumber.borrowingTotal),
    borrowingPeriodYear:
      paramsAsNumber.borrowingPeriodMonth === undefined
        ? prev.borrowingPeriodYear
        : Year.cast(paramsAsNumber.borrowingPeriodMonth),
    interestRatePercentPerYear:
      paramsAsNumber.interestRatePerMonth === undefined
        ? prev.interestRatePercentPerYear
        : PercentFloat.cast(paramsAsNumber.interestRatePerMonth),
  };
};
