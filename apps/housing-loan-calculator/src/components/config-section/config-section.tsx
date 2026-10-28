import { Label } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { dict } from '../../constants/index.mjs';
import { loanStore } from '../../store/index.mjs';
import {
  PercentFloatNumericInput,
  YearNumericInput,
  YenNumericInput,
} from '../numeric-input/index.mjs';
import { RepaymentTypeRadioGroup } from './repayment-type-radio-group.js';

export const ConfigSection = memoNamed('ConfigSection', () => {
  const {
    repaymentType,
    borrowingTotalManYen,
    borrowingPeriodYear,
    interestRatePercentPerYear,
  } = useObservableValue(loanStore.inputs);

  return (
    <>
      <SectionTitle>{dict.settings}</SectionTitle>
      <ConfigElement>
        <Label>
          {dict.borrowingTotalManYen}
          <YenNumericInput
            cyId={'numericInput-borrowingTotalManYen'}
            min={0}
            value={borrowingTotalManYen}
            onValueChange={loanStore.setBorrowingTotalManYen}
          />
        </Label>
      </ConfigElement>
      <ConfigElement>
        <Label>
          {dict.borrowingPeriodYear}
          <YearNumericInput
            cyId={'numericInput-borrowingPeriodYear'}
            min={1}
            value={borrowingPeriodYear}
            onValueChange={loanStore.setBorrowingPeriodYear}
          />
        </Label>
      </ConfigElement>
      <ConfigElement>
        <Label>
          {dict.interestRatePerYear}
          <PercentFloatNumericInput
            cyId={'numericInput-interestRatePerYear'}
            max={100}
            min={0}
            value={interestRatePercentPerYear}
            onValueChange={loanStore.setInterestRatePercentPerYear}
          />
        </Label>
      </ConfigElement>
      <ConfigElement data-e2e={'repaymentTypeRadioGroup'}>
        <RepaymentTypeRadioGroup
          repaymentType={repaymentType}
          onRepaymentTypeChange={loanStore.setRepaymentType}
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
