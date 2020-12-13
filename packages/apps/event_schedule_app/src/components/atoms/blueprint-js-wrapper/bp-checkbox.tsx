import { Checkbox, ICheckboxProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { useCallback } from 'react';

interface Props extends ICheckboxProps {
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

export const BpCheckbox = memoNamed<Props>(
  'BpInput',
  ({ checked, onCheck, ...props }) => {
    const onChangeHandler = useCallback(
      (ev: React.FormEvent<HTMLInputElement>) => {
        onCheck(ev.currentTarget.checked);
      },
      [onCheck]
    );

    return <Checkbox checked={checked} onChange={onChangeHandler} {...props} />;
  }
);
