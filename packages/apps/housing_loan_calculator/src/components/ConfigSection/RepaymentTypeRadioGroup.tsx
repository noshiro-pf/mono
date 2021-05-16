import { Radio, RadioGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { FormEvent } from 'react';
import { useCallback } from 'react';
import { viewTexts } from '../../constants/view-texts';
import type { RepaymentType } from '../../types/enum/repayment-type';

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
