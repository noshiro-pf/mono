import { useNavigator, useQuery } from '@mono/react-router-utils';
import { memoNamed, useDebounce } from '@mono/react-utils';
import { mapNullable, pipe, stringToNumber } from '@mono/ts-utils';
import React, { useEffect, useState } from 'react';
import { AppView } from './App-view';
import { defaultValues } from './constants/default-values';
import { calcAll } from './functions/calc-all';
import { queryParams } from './route/query-params';
import { CalculatingStateType } from './types/enum/calculating-state';
import { RepaymentType } from './types/enum/repayment-type';
import { uriWithQueryParams } from './utils/uri-with-query-params';

export const AppSub = memoNamed('AppSub', () => {
  /* states */

  const [
    // dummy comment to control
    repaymentType,
    setRepaymentType,
  ] = useState<RepaymentType>(defaultValues.repaymentType);

  // 頭金（円）
  const [
    // dummy comment to control
    downPaymentManYen,
    setDownPaymentManYen,
  ] = useState<number>(defaultValues.downPayment);

  // 物件の金額（円）
  const [
    // dummy comment to control
    propertyPriceManYen,
    setPropertyPriceManYen,
  ] = useState<number>(defaultValues.propertyPrice);

  // 借入期間（月）
  const [
    // dummy comment to control
    borrowingPeriodYear,
    setBorrowingPeriodYear,
  ] = useState<number>(defaultValues.borrowingPeriodYear);

  // 月当たりの金利
  const [
    // dummy comment to control
    interestRatePercentPerYear,
    setInterestRatePercentPerYear,
  ] = useState<number>(defaultValues.interestRatePercentPerYear);

  /* side effects */

  const query = useQuery();

  useEffect(
    () => {
      const paramsAsStr = {
        repaymentType: query.get(queryParams.repaymentType),
        downPayment: query.get(queryParams.downPayment),
        propertyPrice: query.get(queryParams.propertyPrice),
        borrowingPeriodMonth: query.get(queryParams.borrowingPeriodMonth),
        interestRatePerMonth: query.get(queryParams.interestRatePerMonth),
      };

      const paramsAsNumber = {
        repaymentType: pipe(
          paramsAsStr.repaymentType,
          mapNullable(stringToNumber)
        ),
        downPayment: pipe(paramsAsStr.downPayment, mapNullable(stringToNumber)),
        propertyPrice: pipe(
          paramsAsStr.propertyPrice,
          mapNullable(stringToNumber)
        ),
        borrowingPeriodMonth: pipe(
          paramsAsStr.borrowingPeriodMonth,
          mapNullable(stringToNumber)
        ),
        interestRatePerMonth: pipe(
          paramsAsStr.interestRatePerMonth,
          mapNullable(stringToNumber)
        ),
      };

      if (
        paramsAsStr.repaymentType ===
          'principal-and-interest-equal-repayment' ||
        paramsAsStr.repaymentType === 'principal-equal-payment'
      ) {
        setRepaymentType(paramsAsStr.repaymentType);
      }
      if (paramsAsNumber.downPayment !== undefined) {
        setDownPaymentManYen(paramsAsNumber.downPayment);
      }
      if (paramsAsNumber.propertyPrice !== undefined) {
        setPropertyPriceManYen(paramsAsNumber.propertyPrice);
      }
      if (paramsAsNumber.borrowingPeriodMonth !== undefined) {
        setBorrowingPeriodYear(paramsAsNumber.borrowingPeriodMonth);
      }
      if (paramsAsNumber.interestRatePerMonth !== undefined) {
        setInterestRatePercentPerYear(paramsAsNumber.interestRatePerMonth);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [
    // dummy comment to control
    calculationState,
    setCalculationState,
  ] = useState<CalculatingStateType>('idling');

  useEffect(() => {
    setCalculationState('calculating');
  }, [
    repaymentType,
    downPaymentManYen,
    propertyPriceManYen,
    borrowingPeriodYear,
    interestRatePercentPerYear,
  ]);

  const navigator = useNavigator();

  const {
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  } = useDebounce(
    () => {
      setCalculationState('idling');

      navigator(
        uriWithQueryParams('/', [
          [queryParams.repaymentType, repaymentType],
          [queryParams.downPayment, downPaymentManYen],
          [queryParams.propertyPrice, propertyPriceManYen],
          [queryParams.borrowingPeriodMonth, borrowingPeriodYear],
          [queryParams.interestRatePerMonth, interestRatePercentPerYear],
        ])
      );

      return calcAll(
        repaymentType,
        downPaymentManYen,
        propertyPriceManYen,
        borrowingPeriodYear,
        interestRatePercentPerYear
      );
    },
    [
      navigator,
      repaymentType,
      downPaymentManYen,
      propertyPriceManYen,
      borrowingPeriodYear,
      interestRatePercentPerYear,
    ],
    500
  );

  return (
    <AppView
      calculationState={calculationState}
      downPaymentManYen={downPaymentManYen}
      onDownPaymentManYenChange={setDownPaymentManYen}
      propertyPriceManYen={propertyPriceManYen}
      onPropertyPriceManYenChange={setPropertyPriceManYen}
      borrowingPeriodYear={borrowingPeriodYear}
      onBorrowingPeriodYearChange={setBorrowingPeriodYear}
      interestRatePercentPerYear={interestRatePercentPerYear}
      onInterestRatePercentPerYearChange={setInterestRatePercentPerYear}
      repaymentType={repaymentType}
      onRepaymentTypeChange={setRepaymentType}
      borrowingBalanceYen={borrowingBalanceYen}
      interestYen={interestYen}
      monthlyPaymentTotalYen={monthlyPaymentTotalYen}
      monthlyPrincipalPaymentYen={monthlyPrincipalPaymentYen}
      fixedPrincipalYenPerMonth={fixedPrincipalYenPerMonth}
      fixedMonthlyPaymentsYen={fixedMonthlyPaymentsYen}
      interestSumManYen={interestSumManYen}
    />
  );
});
