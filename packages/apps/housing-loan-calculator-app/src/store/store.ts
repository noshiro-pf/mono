import { defaultValues, queryParamKey } from '../constants';
import { type RepaymentType, type Store } from '../types';
import { uriWithQueryParams } from '../utils';

const [userInput$, nextUserInput] = createVoidEventEmitter();

const { state$: repaymentType$, setState: _setRepaymentType } =
  createState<RepaymentType>(defaultValues.repaymentType);

const setRepaymentType = (value: RepaymentType): void => {
  _setRepaymentType(value);
  nextUserInput();
};

// 頭金（円）
const { state$: downPaymentManYen$, setState: _setDownPaymentManYen } =
  createState<number>(defaultValues.downPaymentManYen);

const setDownPaymentManYen = (value: number): void => {
  _setDownPaymentManYen(value);
  nextUserInput();
};

// 物件の金額（円）
const { state$: propertyPriceManYen$, setState: _setPropertyPriceManYen } =
  createState<number>(defaultValues.propertyPriceManYen);

const setPropertyPriceManYen = (value: number): void => {
  _setPropertyPriceManYen(value);
  nextUserInput();
};

// 借入期間（月）
const { state$: borrowingPeriodYear$, setState: _setBorrowingPeriodYear } =
  createState<number>(defaultValues.borrowingPeriodYear);

const setBorrowingPeriodYear = (value: number): void => {
  _setBorrowingPeriodYear(value);
  nextUserInput();
};

// 月当たりの金利
const {
  state$: interestRatePercentPerYear$,
  setState: _setInterestRatePercentPerYear,
} = createState<number>(defaultValues.interestRatePercentPerYear);

const setInterestRatePercentPerYear = (value: number): void => {
  _setInterestRatePercentPerYear(value);
  nextUserInput();
};

const store$: InitializedObservable<Store> = combineLatestI([
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

queryParams$.subscribe((query) => {
  const paramsAsStr = {
    repaymentType: query.get(queryParamKey.repaymentType),
    downPayment: query.get(queryParamKey.downPayment),
    propertyPrice: query.get(queryParamKey.propertyPrice),
    borrowingPeriodMonth: query.get(queryParamKey.borrowingPeriodMonth),
    interestRatePerMonth: query.get(queryParamKey.interestRatePerMonth),
  } as const;

  const paramsAsNumber = {
    downPayment: mapOptional(paramsAsStr.downPayment, Str.toNumber),
    propertyPrice: mapOptional(paramsAsStr.propertyPrice, Str.toNumber),
    borrowingPeriodMonth: mapOptional(
      paramsAsStr.borrowingPeriodMonth,
      Str.toNumber
    ),
    interestRatePerMonth: mapOptional(
      paramsAsStr.interestRatePerMonth,
      Str.toNumber
    ),
  } as const;

  if (
    paramsAsStr.repaymentType === 'principal-and-interest-equal-repayment' ||
    paramsAsStr.repaymentType === 'principal-equal-payment'
  ) {
    _setRepaymentType(paramsAsStr.repaymentType);
  }
  if (paramsAsNumber.downPayment !== undefined) {
    _setDownPaymentManYen(paramsAsNumber.downPayment);
  }
  if (paramsAsNumber.propertyPrice !== undefined) {
    _setPropertyPriceManYen(paramsAsNumber.propertyPrice);
  }
  if (paramsAsNumber.borrowingPeriodMonth !== undefined) {
    _setBorrowingPeriodYear(paramsAsNumber.borrowingPeriodMonth);
  }
  if (paramsAsNumber.interestRatePerMonth !== undefined) {
    _setInterestRatePercentPerYear(paramsAsNumber.interestRatePerMonth);
  }
});

userInput$.chain(withLatestFrom(store$)).subscribe(([_, store]) => {
  push(
    uriWithQueryParams('/', [
      [queryParamKey.repaymentType, store.repaymentType],
      [queryParamKey.downPayment, store.downPaymentManYen],
      [queryParamKey.propertyPrice, store.propertyPriceManYen],
      [queryParamKey.borrowingPeriodMonth, store.borrowingPeriodYear],
      [queryParamKey.interestRatePerMonth, store.interestRatePercentPerYear],
    ])
  );
});

export {
  setRepaymentType,
  setDownPaymentManYen,
  setPropertyPriceManYen,
  setBorrowingPeriodYear,
  setInterestRatePercentPerYear,
  store$,
};
