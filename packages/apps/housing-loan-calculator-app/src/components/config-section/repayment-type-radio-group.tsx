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
      (ev: React.FormEvent<HTMLInputElement>) => {
        onRepaymentTypeChange(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          ev.currentTarget.value as RepaymentType,
        );
      },
      [onRepaymentTypeChange],
    );

    return (
      <RadioGroup
        label={dict.repaymentType}
        selectedValue={repaymentType}
        onChange={onChange}
      >
        <Radio
          data-cy={'radio--principal-equal-payment'}
          label={dict.principalEqualPayment}
          value='principal-equal-payment'
        />
        <Radio
          data-cy={'radio--principal-and-interest-equal-repayment'}
          label={dict.principalAndInterestEqualRepayment}
          value='principal-and-interest-equal-repayment'
        />
      </RadioGroup>
    );
  },
);
