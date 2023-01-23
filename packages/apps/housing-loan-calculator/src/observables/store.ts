import {
  combineLatestI,
  distinctUntilChangedI,
  mapI,
  subject,
  withInitialValue,
  type InitializedObservable,
} from '@noshiro/syncflow';
import { defaultValues } from '../constants';
import { type RepaymentType, type Store } from '../types';

export const userInput$ = subject();

const repaymentTypeSource$ = subject<RepaymentType>();

export const setRepaymentType = (value: RepaymentType): void => {
  repaymentTypeSource$.next(value);
  userInput$.next(0);
};

export const loadRepaymentType = (value: RepaymentType): void => {
  repaymentTypeSource$.next(value);
};

const repaymentType$: InitializedObservable<RepaymentType> =
  repaymentTypeSource$
    .chain(withInitialValue(defaultValues.repaymentType))
    .chain(distinctUntilChangedI());

// 頭金（円）
const downPaymentManYenSource$ = subject<number>();

export const setDownPaymentManYen = (value: number): void => {
  downPaymentManYenSource$.next(value);
  userInput$.next(0);
};

export const loadDownPaymentManYen = (value: number): void => {
  downPaymentManYenSource$.next(value);
};

const downPaymentManYen$: InitializedObservable<number> =
  downPaymentManYenSource$
    .chain(withInitialValue(defaultValues.downPaymentManYen))
    .chain(distinctUntilChangedI());

// 物件の金額（円）
const propertyPriceManYenSource$ = subject<number>();

export const setPropertyPriceManYen = (value: number): void => {
  propertyPriceManYenSource$.next(value);
  userInput$.next(0);
};

export const loadPropertyPriceManYen = (value: number): void => {
  propertyPriceManYenSource$.next(value);
};

const propertyPriceManYen$: InitializedObservable<number> =
  propertyPriceManYenSource$
    .chain(withInitialValue(defaultValues.propertyPriceManYen))
    .chain(distinctUntilChangedI());

// 借入期間（月）
const borrowingPeriodYearSource$ = subject<number>();

export const setBorrowingPeriodYear = (value: number): void => {
  borrowingPeriodYearSource$.next(value);
  userInput$.next(0);
};

export const loadBorrowingPeriodYear = (value: number): void => {
  borrowingPeriodYearSource$.next(value);
};

const borrowingPeriodYear$: InitializedObservable<number> =
  borrowingPeriodYearSource$
    .chain(withInitialValue(defaultValues.borrowingPeriodYear))
    .chain(distinctUntilChangedI());

// 月当たりの金利
const interestRatePercentPerYearSource$ = subject<number>();

export const setInterestRatePercentPerYear = (value: number): void => {
  interestRatePercentPerYearSource$.next(value);
  userInput$.next(0);
};

export const loadInterestRatePercentPerYear = (value: number): void => {
  interestRatePercentPerYearSource$.next(value);
};

const interestRatePercentPerYear$: InitializedObservable<number> =
  interestRatePercentPerYearSource$
    .chain(withInitialValue(defaultValues.interestRatePercentPerYear))
    .chain(distinctUntilChangedI());

export const store$: InitializedObservable<Store> = combineLatestI([
  repaymentType$,
  downPaymentManYen$,
  propertyPriceManYen$,
  borrowingPeriodYear$,
  interestRatePercentPerYear$,
] as const).chain(
  mapI(
    ([
      repaymentType,
      downPaymentManYen,
      propertyPriceManYen,
      borrowingPeriodYear,
      interestRatePercentPerYear,
    ]) => ({
      repaymentType,
      downPaymentManYen,
      propertyPriceManYen,
      borrowingPeriodYear,
      interestRatePercentPerYear,
    })
  )
);
