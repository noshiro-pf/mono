import { HTMLSelect } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

export type BpSelectProps = Omit<HTMLSelectPropsOriginal, 'options'> &
  Readonly<{
    onValueChange: (value: string) => void;
    options: Readonly<HTMLSelectPropsOriginal['options']>;
  }>;

type HTMLSelectPropsOriginal = React.ComponentProps<typeof HTMLSelect>;

export const BpSelect = memoNamed<BpSelectProps>(
  'BpSelect',
  ({ value, onValueChange, options, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.ChangeEvent<HTMLSelectElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange],
    );

    return (
      <HTMLSelect
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        options={options}
        value={value}
        onChange={onChangeHandler}
      />
    );
  },
);
