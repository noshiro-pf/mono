import type { HTMLSelectProps } from '@blueprintjs/core';
import { HTMLSelect } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { StrictOmit } from '@noshiro/ts-utils';
import type { ChangeEvent } from 'react';
import { useCallback } from 'react';

type Props = Readonly<{
  onValueChange: (value: string) => void;
  options: Readonly<HTMLSelectProps['options']>;
}> &
  StrictOmit<HTMLSelectProps, 'options'>;

export const BpSelect = memoNamed<Props>(
  'BpSelect',
  ({ value, onValueChange, options, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
      (ev: ChangeEvent<HTMLSelectElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    return (
      <HTMLSelect
        value={value}
        onChange={onChangeHandler}
        options={options as HTMLSelectProps['options']}
        {...props}
      />
    );
  }
);
