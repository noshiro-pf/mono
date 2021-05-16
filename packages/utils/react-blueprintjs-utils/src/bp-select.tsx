import type { HTMLSelectProps } from '@blueprintjs/core';
import { HTMLSelect } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ChangeEvent } from 'react';
import { useCallback } from 'react';

type Props = HTMLSelectProps &
  Readonly<{
    onValueChange: (value: string) => void;
  }>;

export const BpSelect = memoNamed<Props>(
  'BpSelect',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (ev: ChangeEvent<HTMLSelectElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    return <HTMLSelect value={value} onChange={onChangeHandler} {...props} />;
  }
);
