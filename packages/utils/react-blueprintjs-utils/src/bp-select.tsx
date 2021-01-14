import { HTMLSelect, IHTMLSelectProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import { useCallback } from 'react';

interface Props extends IHTMLSelectProps {
  onValueChange: (value: string) => void;
}

export const BpSelect = memoNamed<Props>(
  'BpSelect',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        onValueChange(event.target.value);
      },
      [onValueChange]
    );

    return <HTMLSelect value={value} onChange={onChangeHandler} {...props} />;
  }
);
