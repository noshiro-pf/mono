import { Spinner } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { ConfigSection } from './components/ConfigSection/ConfigSection';
import { PaymentTable } from './components/PaymentTable/PaymentTable';
import { SummarySection } from './components/SummarySection/SummarySection';
import { viewTexts } from './constants/view-texts';
import { CalculatingStateType } from './types/enum/calculating-state';
import { RepaymentType } from './types/enum/repayment-type';

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

interface Props {
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
  borrowingBalanceYen: number[]; // 借入残高（円）
  interestYen: number[]; // 利息（円）
  monthlyPaymentTotalYen: number[]; // 月支払い額（円）
  monthlyPrincipalPaymentYen: number[]; // 月々の元金支払額（円）
  fixedPrincipalYenPerMonth: number; // 元金の月額（円）
  fixedMonthlyPaymentsYen: number; // 月額
  interestSumManYen: number; // 利息合計額
}

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
            downPaymentManYen={downPaymentManYen}
            onDownPaymentManYenChange={onDownPaymentManYenChange}
            propertyPriceManYen={propertyPriceManYen}
            onPropertyPriceManYenChange={onPropertyPriceManYenChange}
            borrowingPeriodYear={borrowingPeriodYear}
            onBorrowingPeriodYearChange={onBorrowingPeriodYearChange}
            interestRatePercentPerYear={interestRatePercentPerYear}
            onInterestRatePercentPerYearChange={
              onInterestRatePercentPerYearChange
            }
            repaymentType={repaymentType}
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
              repaymentType={repaymentType}
              propertyPriceManYen={propertyPriceManYen}
              downPaymentManYen={downPaymentManYen}
              fixedPrincipalYenPerMonth={fixedPrincipalYenPerMonth}
              fixedMonthlyPaymentsYen={fixedMonthlyPaymentsYen}
              interestSumManYen={interestSumManYen}
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
              repaymentType={repaymentType}
              borrowingBalanceYen={borrowingBalanceYen}
              interestYen={interestYen}
              monthlyPaymentTotalYen={monthlyPaymentTotalYen}
              monthlyPrincipalPaymentYen={monthlyPrincipalPaymentYen}
            />
          )}
        </Paper>
      </Section>
    </Root>
  )
);
