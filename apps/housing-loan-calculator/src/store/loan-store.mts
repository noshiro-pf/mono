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
import { isNullish, Num, Result } from 'ts-data-forge';
import type * as t from 'ts-fortress';
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
 * `value` as a number of `type`, or `prev` when it is missing, not a finite
 * number (`Num.safeParseFloat` refuses `''`, `'12px'` and `'Infinity'`, which
 * `Number` reads as `0`, `NaN` and `Infinity`), or not one `type` accepts.
 */
const numberFromQuery = <A extends number>(
  type: t.Type<A>,
  value: string | null | undefined,
  prev: A,
): A => {
  if (isNullish(value)) {
    return prev;
  }

  const parsed = Num.safeParseFloat(value);

  return Result.isOk(parsed) && type.is(parsed.value) ? parsed.value : prev;
};

/**
 * The URL is the one place the inputs are kept: a value missing from it, or
 * not a valid one, stays as it was.
 */
const storeFromQuery = (
  prev: Store,
  { searchParams: query }: RouterState,
): Store => {
  const repaymentType = query.get(queryParamKey.repaymentType);

  return {
    repaymentType:
      repaymentType === 'principal-and-interest-equal-repayment' ||
      repaymentType === 'principal-equal-payment'
        ? repaymentType
        : prev.repaymentType,
    borrowingTotalManYen: numberFromQuery(
      Yen,
      query.get(queryParamKey.borrowingTotal),
      prev.borrowingTotalManYen,
    ),
    borrowingPeriodYear: numberFromQuery(
      Year,
      query.get(queryParamKey.borrowingPeriodMonth),
      prev.borrowingPeriodYear,
    ),
    interestRatePercentPerYear: numberFromQuery(
      PercentFloat,
      query.get(queryParamKey.interestRatePerMonth),
      prev.interestRatePercentPerYear,
    ),
  };
};
