import {
  setBorrowingPeriodYear,
  setDownPaymentManYen,
  setInterestRatePercentPerYear,
  setPropertyPriceManYen,
  setRepaymentType,
  store$,
} from '../../store';
import { BpNumericInputWithLabel } from '../blueprint-wrapper';
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
        <BpNumericInputWithLabel
          cyId={'numericInput-downPaymentManYen'}
          label={dict.downPaymentManYen}
          min={0}
          value={downPaymentManYen}
          onValueChange={setDownPaymentManYen as (a: number) => void}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          cyId={'numericInput-propertyPriceManYen'}
          label={dict.propertyPriceManYen}
          min={0}
          value={propertyPriceManYen}
          onValueChange={setPropertyPriceManYen as (a: number) => void}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          cyId={'numericInput-borrowingPeriodYear'}
          label={dict.borrowingPeriodYear}
          min={1}
          value={borrowingPeriodYear}
          onValueChange={setBorrowingPeriodYear as (a: number) => void}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          cyId={'numericInput-interestRatePerYear'}
          label={dict.interestRatePerYear}
          max={100}
          min={0}
          value={interestRatePercentPerYear}
          onValueChange={setInterestRatePercentPerYear as (a: number) => void}
        />
      </ConfigElement>
      <ConfigElement data-cy={'repaymentTypeRadioGroup'}>
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
