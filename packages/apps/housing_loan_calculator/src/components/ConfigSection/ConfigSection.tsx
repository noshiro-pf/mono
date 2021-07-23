import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { viewTexts } from '../../constants';
import type { RepaymentType } from '../../types';
import { BpNumericInputWithLabel } from '../blueprint-wrapper';
import { RepaymentTypeRadioGroup } from './RepaymentTypeRadioGroup';

const SectionTitle = styled.div`
  padding: 10px 0;
  font-size: large;
  font-weight: bold;
`;

const ConfigElement = styled.div`
  display: flex;
`;

type Props = Readonly<{
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
}>;

export const ConfigSection = memoNamed<Props>(
  'ConfigSection',
  ({
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
  }) => (
    <>
      <SectionTitle>{viewTexts.settings}</SectionTitle>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.downPayment}
          min={0}
          value={downPaymentManYen}
          onValueChange={onDownPaymentManYenChange}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.propertyPrice}
          min={0}
          value={propertyPriceManYen}
          onValueChange={onPropertyPriceManYenChange}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.borrowingPeriodMonth}
          min={1}
          value={borrowingPeriodYear}
          onValueChange={onBorrowingPeriodYearChange}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.interestRatePerMonth}
          max={100}
          min={0}
          value={interestRatePercentPerYear}
          onValueChange={onInterestRatePercentPerYearChange}
        />
      </ConfigElement>
      <ConfigElement>
        <RepaymentTypeRadioGroup
          repaymentType={repaymentType}
          onRepaymentTypeChange={onRepaymentTypeChange}
        />
      </ConfigElement>
    </>
  )
);
