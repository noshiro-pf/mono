import { withLatestFrom } from '@noshiro/syncflow';
import { useStreamEffect, useStreamValue } from '@noshiro/syncflow-react-hooks';
import { push, useQueryParams } from '@noshiro/tiny-router-react-hooks';
import { mapNullable, pipe, stringToNumber } from '@noshiro/ts-utils';
import { useEffect } from 'react';
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
    };

    const paramsAsNumber = {
      repaymentType: pipe(paramsAsStr.repaymentType).chain((a) =>
        mapNullable(a, stringToNumber)
      ).value,
      downPayment: pipe(paramsAsStr.downPayment).chain((a) =>
        mapNullable(a, stringToNumber)
      ).value,
      propertyPrice: pipe(paramsAsStr.propertyPrice).chain((a) =>
        mapNullable(a, stringToNumber)
      ).value,
      borrowingPeriodMonth: pipe(paramsAsStr.borrowingPeriodMonth).chain((a) =>
        mapNullable(a, stringToNumber)
      ).value,
      interestRatePerMonth: pipe(paramsAsStr.interestRatePerMonth).chain((a) =>
        mapNullable(a, stringToNumber)
      ).value,
    };

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

  useStreamEffect(userInput$.chain(withLatestFrom(store$)), ([_, store]) => {
    push(
      uriWithQueryParams('/', [
        [queryParams.repaymentType, store.repaymentType],
        [queryParams.downPayment, store.downPaymentManYen],
        [queryParams.propertyPrice, store.propertyPriceManYen],
        [queryParams.borrowingPeriodMonth, store.borrowingPeriodYear],
        [queryParams.interestRatePerMonth, store.interestRatePercentPerYear],
      ])
    );
  });

  const isCalculating = useStreamValue(isCalculating$);

  return {
    isCalculating,
  };
};
