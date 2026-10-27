import { scan, type InitializedObservable } from 'synstate';
import type { RouterState } from 'tiny-router-observable';
import { Num, pipe } from 'ts-data-forge';
import { defaultValues, queryParamKey } from '../constants/index.mjs';
import { Router } from '../router.mjs';
import {
  PercentFloat,
  Year,
  Yen,
  type RepaymentType,
  type Store,
} from '../types/index.mjs';
import { uriWithQueryParams } from '../utils/index.mjs';

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

const store$: InitializedObservable<Store> = Router.state.pipe(
  scan(
    storeFromQuery,
    storeFromQuery(defaultValues, Router.state.getSnapshot().value),
  ),
);

const setStore = (patch: Partial<Store>): void => {
  const store = { ...store$.getSnapshot().value, ...patch } as const;

  Router.push(
    uriWithQueryParams('/', [
      [queryParamKey.repaymentType, store.repaymentType],
      [queryParamKey.borrowingTotal, store.borrowingTotalManYen],
      [queryParamKey.borrowingPeriodMonth, store.borrowingPeriodYear],
      [queryParamKey.interestRatePerMonth, store.interestRatePercentPerYear],
    ]),
  );
};

const setRepaymentType = (repaymentType: RepaymentType): void => {
  setStore({ repaymentType });
};

// 借入金額（万円）
const setBorrowingTotalManYen = (borrowingTotalManYen: Yen): void => {
  setStore({ borrowingTotalManYen });
};

// 借入期間（年）
const setBorrowingPeriodYear = (borrowingPeriodYear: Year): void => {
  setStore({ borrowingPeriodYear });
};

// 年当たりの金利
const setInterestRatePercentPerYear = (
  interestRatePercentPerYear: PercentFloat,
): void => {
  setStore({ interestRatePercentPerYear });
};

export {
  setBorrowingPeriodYear,
  setBorrowingTotalManYen,
  setInterestRatePercentPerYear,
  setRepaymentType,
  store$,
};
