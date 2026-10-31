import { RadioGroup } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import type { RepaymentType } from '../../types/index.mjs';

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

const options = [
  {
    value: 'principal-equal-payment',
    label: constant(dict.principalEqualPayment),
    'data-e2e': 'radio--principal-equal-payment',
  },
  {
    value: 'principal-and-interest-equal-repayment',
    label: constant(dict.principalAndInterestEqualRepayment),
    'data-e2e': 'radio--principal-and-interest-equal-repayment',
  },
] as const;
