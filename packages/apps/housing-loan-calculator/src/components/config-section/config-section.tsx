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
          label={dict.downPaymentManYen}
          min={0}
          value={downPaymentManYen}
          onValueChange={setDownPaymentManYen}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={dict.propertyPriceManYen}
          min={0}
          value={propertyPriceManYen}
          onValueChange={setPropertyPriceManYen}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={dict.borrowingPeriodYear}
          min={1}
          value={borrowingPeriodYear}
          onValueChange={setBorrowingPeriodYear}
        />
      </ConfigElement>
      <ConfigElement>
        <BpNumericInputWithLabel
          label={dict.interestRatePerYear}
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
