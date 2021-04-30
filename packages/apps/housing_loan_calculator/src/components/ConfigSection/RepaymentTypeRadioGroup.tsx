import { Radio, RadioGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { FormEvent, useCallback } from 'react';
import { viewTexts } from '../../constants/view-texts';
import { RepaymentType } from '../../types/enum/repayment-type';

type Props = Readonly<{
  repaymentType: RepaymentType;
  onRepaymentTypeChange: (value: RepaymentType) => void;
}>;

export const RepaymentTypeRadioGroup = memoNamed<Props>(
  'RepaymentTypeRadioGroup',
  ({ repaymentType, onRepaymentTypeChange }) => {
    const onChange = useCallback(
      (ev: FormEvent<HTMLInputElement>) => {
        onRepaymentTypeChange(ev.currentTarget.value as RepaymentType);
      },
      [onRepaymentTypeChange]
    );

    return (
      <RadioGroup
        label={viewTexts.repaymentType}
        onChange={onChange}
        selectedValue={repaymentType}
      >
        <Radio
          label={viewTexts.principalEqualPayment}
          value='principal-equal-payment'
        />
        <Radio
          label={viewTexts.principalAndInterestEqualRepayment}
          value='principal-and-interest-equal-repayment'
        />
      </RadioGroup>
    );
  }
);
