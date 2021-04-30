import { HTMLSelect, HTMLSelectProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { ChangeEvent, useCallback } from 'react';

type Props = HTMLSelectProps &
  Readonly<{
    onValueChange: (value: string) => void;
  }>;

export const BpSelect = memoNamed<Props>(
  'BpSelect',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (event: ChangeEvent<HTMLSelectElement>) => {
        onValueChange(event.target.value);
      },
      [onValueChange]
    );

    return <HTMLSelect value={value} onChange={onChangeHandler} {...props} />;
  }
);
