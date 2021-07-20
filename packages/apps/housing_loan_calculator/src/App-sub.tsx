import { useNavigator, useQuery } from '@noshiro/react-router-utils';
import { memoNamed, useDebounce } from '@noshiro/react-utils';
import { mapNullable, pipe, stringToNumber } from '@noshiro/ts-utils';
import { useEffect, useState } from 'react';
import { AppView } from './App-view';
import { defaultValues } from './constants';
import { calcAll } from './functions';
import { queryParams } from './route';
import type { CalculatingStateType, RepaymentType } from './types';
import { uriWithQueryParams } from './utils';

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
        repaymentType: pipe(paramsAsStr.repaymentType).chain((a) =>
          mapNullable(a, stringToNumber)
        ).value,
        downPayment: pipe(paramsAsStr.downPayment).chain((a) =>
          mapNullable(a, stringToNumber)
        ).value,
        propertyPrice: pipe(paramsAsStr.propertyPrice).chain((a) =>
          mapNullable(a, stringToNumber)
        ).value,
        borrowingPeriodMonth: pipe(paramsAsStr.borrowingPeriodMonth).chain(
          (a) => mapNullable(a, stringToNumber)
        ).value,
        interestRatePerMonth: pipe(paramsAsStr.interestRatePerMonth).chain(
          (a) => mapNullable(a, stringToNumber)
        ).value,
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

  const routerNavigator = useNavigator();

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

      routerNavigator(
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
      routerNavigator,
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
