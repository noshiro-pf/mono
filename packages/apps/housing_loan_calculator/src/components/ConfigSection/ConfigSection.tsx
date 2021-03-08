import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { viewTexts } from '../../constants/view-texts';
import { RepaymentType } from '../../types/enum/repayment-type';
import { BpNumericInputWithLabel } from '../blueprint-wrapper/BpNumericInputWithLabel';
import { RepaymentTypeRadioGroup } from './RepaymentTypeRadioGroup';

const SectionTitle = styled.div`
  padding: 10px 0;
  font-size: large;
  font-weight: bold;
`;

const ConfigElement = styled.div`
  display: flex;
`;

interface Props {
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
}

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
          value={downPaymentManYen}
          min={0}
          onValueChange={onDownPaymentManYenChange}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.propertyPrice}
          value={propertyPriceManYen}
          min={0}
          onValueChange={onPropertyPriceManYenChange}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.borrowingPeriodMonth}
          value={borrowingPeriodYear}
          min={1}
          onValueChange={onBorrowingPeriodYearChange}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.interestRatePerMonth}
          value={interestRatePercentPerYear}
          max={100}
          min={0}
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
