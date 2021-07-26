import { Spinner } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { ConfigSection, PaymentTable, SummarySection } from './components';
import { viewTexts } from './constants';
import type { CalculatingStateType, RepaymentType } from './types';

const Root = styled.div`
  padding: 10px;
`;

const Title = styled.div`
  padding: 10px;
  font-size: x-large;
  font-weight: bold;
  color: white;
`;

const Section = styled.div`
  padding: 5px 0;
`;

const Paper = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: #f5f8fa;
`;

const SpinnerWrapper = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = Readonly<{
  calculationState: CalculatingStateType;
  downPaymentManYen: number; // 頭金（万円）
  onDownPaymentManYenChange: (v: number) => void;
  propertyPriceManYen: number; // 物件の金額（万円）
  onPropertyPriceManYenChange: (v: number) => void;
  borrowingPeriodYear: number; // 借入期間（年）
  onBorrowingPeriodYearChange: (v: number) => void;
  interestRatePercentPerYear: number; // 年あたりの金利
  onInterestRatePercentPerYearChange: (v: number) => void;
  repaymentType: RepaymentType;
  onRepaymentTypeChange: (value: RepaymentType) => void;
  borrowingBalanceYen: readonly number[]; // 借入残高（円）
  interestYen: readonly number[]; // 利息（円）
  monthlyPaymentTotalYen: readonly number[]; // 月支払い額（円）
  monthlyPrincipalPaymentYen: readonly number[]; // 月々の元金支払額（円）
  fixedPrincipalYenPerMonth: number; // 元金の月額（円）
  fixedMonthlyPaymentsYen: number; // 月額
  interestSumManYen: number; // 利息合計額
}>;

export const AppView = memoNamed<Props>(
  'AppView',
  ({
    calculationState,
    downPaymentManYen,
    onDownPaymentManYenChange,
    propertyPriceManYen,
    onPropertyPriceManYenChange,
    borrowingPeriodYear,
    onBorrowingPeriodYearChange,
    interestRatePercentPerYear,
    onInterestRatePercentPerYearChange,
    repaymentType,
    onRepaymentTypeChange,
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  }) => (
    <Root>
      <Title>{viewTexts.appTitle}</Title>
      <Section>
        <Paper>
          <ConfigSection
            borrowingPeriodYear={borrowingPeriodYear}
            downPaymentManYen={downPaymentManYen}
            interestRatePercentPerYear={interestRatePercentPerYear}
            propertyPriceManYen={propertyPriceManYen}
            repaymentType={repaymentType}
            onBorrowingPeriodYearChange={onBorrowingPeriodYearChange}
            onDownPaymentManYenChange={onDownPaymentManYenChange}
            onInterestRatePercentPerYearChange={
              onInterestRatePercentPerYearChange
            }
            onPropertyPriceManYenChange={onPropertyPriceManYenChange}
            onRepaymentTypeChange={onRepaymentTypeChange}
          />
        </Paper>
      </Section>
      <Section>
        <Paper>
          {calculationState === 'calculating' ? (
            <SpinnerWrapper>
              <Spinner intent={'primary'} size={Spinner.SIZE_STANDARD} />
            </SpinnerWrapper>
          ) : (
            <SummarySection
              downPaymentManYen={downPaymentManYen}
              fixedMonthlyPaymentsYen={fixedMonthlyPaymentsYen}
              fixedPrincipalYenPerMonth={fixedPrincipalYenPerMonth}
              interestSumManYen={interestSumManYen}
              propertyPriceManYen={propertyPriceManYen}
              repaymentType={repaymentType}
            />
          )}
        </Paper>
      </Section>
      <Section>
        <Paper>
          {calculationState === 'calculating' ? (
            <SpinnerWrapper>
              <Spinner intent={'primary'} size={Spinner.SIZE_STANDARD} />
            </SpinnerWrapper>
          ) : (
            <PaymentTable
              borrowingBalanceYen={borrowingBalanceYen}
              interestYen={interestYen}
              monthlyPaymentTotalYen={monthlyPaymentTotalYen}
              monthlyPrincipalPaymentYen={monthlyPrincipalPaymentYen}
              repaymentType={repaymentType}
            />
          )}
        </Paper>
      </Section>
    </Root>
  )
);
