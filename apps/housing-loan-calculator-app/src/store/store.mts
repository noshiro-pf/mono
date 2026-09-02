import {
  combine,
  createEventEmitter,
  createState,
  type InitializedObservable,
  map,
  withCurrentValueFrom,
} from 'synstate';
import { Num, pipe } from 'ts-data-forge';
import { defaultValues, queryParamKey } from '../constants/index.mjs';
import { Router } from '../router.mjs';
import {
  PercentFloat,
  type RepaymentType,
  type Store,
  Year,
  Yen,
} from '../types/index.mjs';
import { uriWithQueryParams } from '../utils/index.mjs';

const [userInput$, nextUserInput] = createEventEmitter();

const [repaymentType$, setRepaymentType_] = createState<RepaymentType>(
  defaultValues.repaymentType,
);

const setRepaymentType = (value: RepaymentType): void => {
  setRepaymentType_(value);

  nextUserInput();
};

// 頭金（円）
const [downPaymentManYen$, setDownPaymentManYen_] = createState<Yen>(
  defaultValues.downPaymentManYen,
);

const setDownPaymentManYen = (value: Yen): void => {
  setDownPaymentManYen_(value);

  nextUserInput();
};

// 物件の金額（円）
const [propertyPriceManYen$, setPropertyPriceManYen_] = createState<Yen>(
  defaultValues.propertyPriceManYen,
);

const setPropertyPriceManYen = (value: Yen): void => {
  setPropertyPriceManYen_(value);

  nextUserInput();
};

// 借入期間（年）
const [borrowingPeriodYear$, setBorrowingPeriodYear_] = createState<Year>(
  defaultValues.borrowingPeriodYear,
);

const setBorrowingPeriodYear = (value: Year): void => {
  setBorrowingPeriodYear_(value);

  nextUserInput();
};

// 年当たりの金利
const [interestRatePercentPerYear$, setInterestRatePercentPerYear_] =
  createState<PercentFloat>(defaultValues.interestRatePercentPerYear);

const setInterestRatePercentPerYear = (value: PercentFloat): void => {
  setInterestRatePercentPerYear_(value);

  nextUserInput();
};

const store$: InitializedObservable<Store> = combine([
  repaymentType$,
  downPaymentManYen$,
  propertyPriceManYen$,
  borrowingPeriodYear$,
  interestRatePercentPerYear$,
]).pipe(
  map(
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
    }),
  ),
);

Router.state.subscribe(({ searchParams: query }) => {
  const paramsAsStr = {
    repaymentType: query.get(queryParamKey.repaymentType),
    downPayment: query.get(queryParamKey.downPayment),
    propertyPrice: query.get(queryParamKey.propertyPrice),
    borrowingPeriodMonth: query.get(queryParamKey.borrowingPeriodMonth),
    interestRatePerMonth: query.get(queryParamKey.interestRatePerMonth),
  } as const;

  // `mapOptional` has no successor; `pipe(...).mapNullable` is the same
  // mapping, and `URLSearchParams.get` returns `null` rather than `undefined`,
  // which `mapNullable` also covers.
  const paramsAsNumber = {
    downPayment: pipe(paramsAsStr.downPayment).mapNullable(Num.from).value,
    propertyPrice: pipe(paramsAsStr.propertyPrice).mapNullable(Num.from).value,
    borrowingPeriodMonth: pipe(paramsAsStr.borrowingPeriodMonth).mapNullable(
      Num.from,
    ).value,
    interestRatePerMonth: pipe(paramsAsStr.interestRatePerMonth).mapNullable(
      Num.from,
    ).value,
  } as const;

  if (
    paramsAsStr.repaymentType === 'principal-and-interest-equal-repayment' ||
    paramsAsStr.repaymentType === 'principal-equal-payment'
  ) {
    setRepaymentType_(paramsAsStr.repaymentType);
  }

  if (paramsAsNumber.downPayment !== undefined) {
    setDownPaymentManYen_(Yen.cast(paramsAsNumber.downPayment));
  }

  if (paramsAsNumber.propertyPrice !== undefined) {
    setPropertyPriceManYen_(Yen.cast(paramsAsNumber.propertyPrice));
  }

  if (paramsAsNumber.borrowingPeriodMonth !== undefined) {
    setBorrowingPeriodYear_(Year.cast(paramsAsNumber.borrowingPeriodMonth));
  }

  if (paramsAsNumber.interestRatePerMonth !== undefined) {
    setInterestRatePercentPerYear_(
      PercentFloat.cast(paramsAsNumber.interestRatePerMonth),
    );
  }
});

userInput$.pipe(withCurrentValueFrom(store$)).subscribe(([_, store]) => {
  Router.push(
    uriWithQueryParams('/', [
      [queryParamKey.repaymentType, store.repaymentType],
      [queryParamKey.downPayment, store.downPaymentManYen],
      [queryParamKey.propertyPrice, store.propertyPriceManYen],
      [queryParamKey.borrowingPeriodMonth, store.borrowingPeriodYear],
      [queryParamKey.interestRatePerMonth, store.interestRatePercentPerYear],
    ]),
  );
});

export {
  setBorrowingPeriodYear,
  setDownPaymentManYen,
  setInterestRatePercentPerYear,
  setPropertyPriceManYen,
  setRepaymentType,
  store$,
};
