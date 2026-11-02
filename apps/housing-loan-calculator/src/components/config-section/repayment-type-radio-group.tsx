import { RadioGroup } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { repaymentTypes, type RepaymentType } from '../../types/index.mjs';

type Props = Readonly<{
  value: Bindable<RepaymentType>;
  onValueChange: (value: RepaymentType) => void;
}>;

export const RepaymentTypeRadioGroup = ({
  value,
  onValueChange,
}: Props): JSX.Element => (
  <RadioGroup
    label={constant(dict.repaymentType)}
    options={options}
    value={value}
    onValueChange={onValueChange}
  />
);

const labelOf = (value: RepaymentType): string => {
  switch (value) {
    case 'principal-equal-payment':
      return dict.principalEqualPayment;

    case 'principal-and-interest-equal-repayment':
      return dict.principalAndInterestEqualRepayment;
  }
};

const options = repaymentTypes.map(
  (value) =>
    ({
      value,
      label: constant(labelOf(value)),
      'data-e2e': `radio--${value}`,
    }) as const,
);
