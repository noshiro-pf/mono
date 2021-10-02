import { memoNamed } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import styled from 'styled-components';
import { viewTexts } from '../../constants';
import {
  setBorrowingPeriodYear,
  setDownPaymentManYen,
  setInterestRatePercentPerYear,
  setPropertyPriceManYen,
  setRepaymentType,
  store$,
} from '../../observables';
import { BpNumericInputWithLabel } from '../blueprint-wrapper';
import { RepaymentTypeRadioGroup } from './repayment-type-radio-group';

export const ConfigSection = memoNamed('ConfigSection', () => {
  const {
    repaymentType,
    downPaymentManYen,
    propertyPriceManYen,
    borrowingPeriodYear,
    interestRatePercentPerYear,
  } = useStreamValue(store$);

  return (
    <>
      <SectionTitle>{viewTexts.settings}</SectionTitle>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.downPaymentManYen}
          min={0}
          value={downPaymentManYen}
          onValueChange={setDownPaymentManYen}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.propertyPriceManYen}
          min={0}
          value={propertyPriceManYen}
          onValueChange={setPropertyPriceManYen}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.borrowingPeriodYear}
          min={1}
          value={borrowingPeriodYear}
          onValueChange={setBorrowingPeriodYear}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={viewTexts.interestRatePerYear}
          max={100}
          min={0}
          value={interestRatePercentPerYear}
          onValueChange={setInterestRatePercentPerYear}
        />
      </ConfigElement>
      <ConfigElement>
        <RepaymentTypeRadioGroup
          repaymentType={repaymentType}
          onRepaymentTypeChange={setRepaymentType}
        />
      </ConfigElement>
    </>
  );
});

const SectionTitle = styled.div`
  padding: 10px 0;
  font-size: large;
  font-weight: bold;
`;

const ConfigElement = styled.div`
  display: flex;
`;
