import { queryParams } from './constants';
import {
  isCalculating$,
  loadBorrowingPeriodYear,
  loadDownPaymentManYen,
  loadInterestRatePercentPerYear,
  loadPropertyPriceManYen,
  loadRepaymentType,
  store$,
  userInput$,
} from './observables';
import { uriWithQueryParams } from './utils';

export const useMainHooks = (): Readonly<{ isCalculating: boolean }> => {
  const query = useQueryParams();

  useEffect(() => {
    const paramsAsStr = {
      repaymentType: query.get(queryParams.repaymentType),
      downPayment: query.get(queryParams.downPayment),
      propertyPrice: query.get(queryParams.propertyPrice),
      borrowingPeriodMonth: query.get(queryParams.borrowingPeriodMonth),
      interestRatePerMonth: query.get(queryParams.interestRatePerMonth),
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
      loadRepaymentType(paramsAsStr.repaymentType);
    }
    if (paramsAsNumber.downPayment !== undefined) {
      loadDownPaymentManYen(paramsAsNumber.downPayment);
    }
    if (paramsAsNumber.propertyPrice !== undefined) {
      loadPropertyPriceManYen(paramsAsNumber.propertyPrice);
    }
    if (paramsAsNumber.borrowingPeriodMonth !== undefined) {
      loadBorrowingPeriodYear(paramsAsNumber.borrowingPeriodMonth);
    }
    if (paramsAsNumber.interestRatePerMonth !== undefined) {
      loadInterestRatePercentPerYear(paramsAsNumber.interestRatePerMonth);
    }
  }, [query]);

  useObservableEffect(
    userInput$.chain(withLatestFrom(store$)),
    ([_, store]) => {
      push(
        uriWithQueryParams('/', [
          [queryParams.repaymentType, store.repaymentType],
          [queryParams.downPayment, store.downPaymentManYen],
          [queryParams.propertyPrice, store.propertyPriceManYen],
          [queryParams.borrowingPeriodMonth, store.borrowingPeriodYear],
          [queryParams.interestRatePerMonth, store.interestRatePercentPerYear],
        ])
      );
    }
  );

  const isCalculating = useObservableValue(isCalculating$);

  return {
    isCalculating,
  };
};
