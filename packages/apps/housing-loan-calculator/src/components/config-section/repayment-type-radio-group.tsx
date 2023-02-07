import { Radio, RadioGroup } from '@blueprintjs/core';
import { type RepaymentType } from '../../types';

type Props = Readonly<{
  repaymentType: RepaymentType;
  onRepaymentTypeChange: (value: RepaymentType) => void;
}>;

export const RepaymentTypeRadioGroup = memoNamed<Props>(
  'RepaymentTypeRadioGroup',
  ({ repaymentType, onRepaymentTypeChange }) => {
    const onChange = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: FormEvent<HTMLInputElement>) => {
        onRepaymentTypeChange(ev.currentTarget.value as RepaymentType);
      },
      [onRepaymentTypeChange]
    );

    return (
      <RadioGroup
        label={dict.repaymentType}
        selectedValue={repaymentType}
        onChange={onChange}
      >
        <Radio
          label={dict.principalEqualPayment}
          value='principal-equal-payment'
        />
        <Radio
          label={dict.principalAndInterestEqualRepayment}
          value='principal-and-interest-equal-repayment'
        />
      </RadioGroup>
    );
  }
);
