import { Radio, RadioGroup } from '@blueprintjs/core';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { dict } from '../../constants/index.mjs';
import { type RepaymentType } from '../../types/index.mjs';

type Props = Readonly<{
  repaymentType: RepaymentType;
  onRepaymentTypeChange: (value: RepaymentType) => void;
}>;

export const RepaymentTypeRadioGroup = memoNamed<Props>(
  'RepaymentTypeRadioGroup',
  ({ repaymentType, onRepaymentTypeChange }) => {
    const onChange = React.useCallback<
      NonNullable<React.ComponentProps<typeof RadioGroup>['onChange']>
    >(
      (ev) => {
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
          data-e2e={'radio--principal-equal-payment'}
          label={dict.principalEqualPayment}
          value={'principal-equal-payment'}
        />
        <Radio
          data-e2e={'radio--principal-and-interest-equal-repayment'}
          label={dict.principalAndInterestEqualRepayment}
          value={'principal-and-interest-equal-repayment'}
        />
      </RadioGroup>
    );
  },
);
