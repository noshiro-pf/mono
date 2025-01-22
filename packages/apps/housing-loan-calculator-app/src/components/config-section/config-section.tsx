import { Label } from '@blueprintjs/core';
import {
  setBorrowingPeriodYear,
  setDownPaymentManYen,
  setInterestRatePercentPerYear,
  setPropertyPriceManYen,
  setRepaymentType,
  store$,
} from '../../store';
import {
  PercentFloatNumericInput,
  YearNumericInput,
  YenNumericInput,
} from '../numeric-input';
import { RepaymentTypeRadioGroup } from './repayment-type-radio-group';

export const ConfigSection = memoNamed('ConfigSection', () => {
  const {
    repaymentType,
    downPaymentManYen,
    propertyPriceManYen,
    borrowingPeriodYear,
    interestRatePercentPerYear,
  } = useObservableValue(store$);

  return (
    <>
      <SectionTitle>{dict.settings}</SectionTitle>
      <ConfigElement>
        <Label>
          {dict.downPaymentManYen}
          <YenNumericInput
            cyId={'numericInput-downPaymentManYen'}
            min={0}
            value={downPaymentManYen}
            onValueChange={setDownPaymentManYen}
          />
        </Label>
      </ConfigElement>
      <ConfigElement>
        <Label>
          {dict.propertyPriceManYen}
          <YenNumericInput
            cyId={'numericInput-propertyPriceManYen'}
            min={0}
            value={propertyPriceManYen}
            onValueChange={setPropertyPriceManYen}
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
            onValueChange={setBorrowingPeriodYear}
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
            onValueChange={setInterestRatePercentPerYear}
          />
        </Label>
      </ConfigElement>
      <ConfigElement data-e2e={'repaymentTypeRadioGroup'}>
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
