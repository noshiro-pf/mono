import { IInputGroupProps, InputGroup } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { useCallback } from 'react';

interface Props extends IInputGroupProps {
  onValueChange: (value: string) => void;
}

export const BpInput = memoNamed<Props>(
  'BpInput',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLInputElement>
      ) => {
        onValueChange(event.target.value);
      },
      [onValueChange]
    );

    return <InputGroup value={value} onChange={onChangeHandler} {...props} />;
  }
);
