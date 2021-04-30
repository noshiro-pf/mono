import { Checkbox, CheckboxProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { FormEvent, useCallback } from 'react';

type Props = CheckboxProps &
  Readonly<{
    checked: boolean;
    onCheck: (checked: boolean) => void;
  }>;

export const BpCheckbox = memoNamed<Props>(
  'BpCheckbox',
  ({ checked, onCheck, ...props }) => {
    const onChangeHandler = useCallback(
      (ev: FormEvent<HTMLInputElement>) => {
        onCheck(ev.currentTarget.checked);
      },
      [onCheck]
    );

    return <Checkbox checked={checked} onChange={onChangeHandler} {...props} />;
  }
);
