import { Checkbox, ICheckboxProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

interface Props extends ICheckboxProps {
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

export const BpCheckbox = memoNamed<Props>(
  'BpCheckbox',
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
