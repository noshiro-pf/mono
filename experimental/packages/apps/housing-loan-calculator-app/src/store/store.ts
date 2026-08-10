import { defaultValues, queryParamKey } from '../constants';
import { Router } from '../router';
import { PercentFloat, Yen, type RepaymentType, type Store } from '../types';
import { uriWithQueryParams } from '../utils';

const [userInput$, nextUserInput] = createVoidEventEmitter();

const { state: repaymentType$, setState: setRepaymentType_ } =
  createState<RepaymentType>(defaultValues.repaymentType);

const setRepaymentType = (value: RepaymentType): void => {
  setRepaymentType_(value);
  nextUserInput();
};

// 頭金（円）
const { state: downPaymentManYen$, setState: setDownPaymentManYen_ } =
  createState<Yen>(defaultValues.downPaymentManYen);

const setDownPaymentManYen = (value: Yen): void => {
  setDownPaymentManYen_(value);
  nextUserInput();
};

// 物件の金額（円）
const { state: propertyPriceManYen$, setState: setPropertyPriceManYen_ } =
  createState<Yen>(defaultValues.propertyPriceManYen);

const setPropertyPriceManYen = (value: Yen): void => {
  setPropertyPriceManYen_(value);
  nextUserInput();
};

// 借入期間（年）
const { state: borrowingPeriodYear$, setState: setBorrowingPeriodYear_ } =
  createState<Uint32>(toUint32(defaultValues.borrowingPeriodYear));

const setBorrowingPeriodYear = (value: Uint32): void => {
  setBorrowingPeriodYear_(value);
  nextUserInput();
};

// 年当たりの金利
const {
  state: interestRatePercentPerYear$,
  setState: setInterestRatePercentPerYear_,
} = createState<PercentFloat>(defaultValues.interestRatePercentPerYear);

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
]).chain(
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

  const paramsAsNumber = {
    downPayment: mapOptional(paramsAsStr.downPayment, Num.from),
    propertyPrice: mapOptional(paramsAsStr.propertyPrice, Num.from),
    borrowingPeriodMonth: mapOptional(
      paramsAsStr.borrowingPeriodMonth,
      Num.from,
    ),
    interestRatePerMonth: mapOptional(
      paramsAsStr.interestRatePerMonth,
      Num.from,
    ),
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
    setBorrowingPeriodYear_(toUint32(paramsAsNumber.borrowingPeriodMonth));
  }
  if (paramsAsNumber.interestRatePerMonth !== undefined) {
    setInterestRatePercentPerYear_(
      PercentFloat.cast(paramsAsNumber.interestRatePerMonth),
    );
  }
});

userInput$.chain(withCurrentValueFrom(store$)).subscribe(([_, store]) => {
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
