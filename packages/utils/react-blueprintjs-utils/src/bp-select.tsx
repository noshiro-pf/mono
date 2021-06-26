import type { HTMLSelectProps } from '@blueprintjs/core';
import { HTMLSelect } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { StrictOmit } from '@noshiro/ts-utils';
import type { ChangeEvent, ComponentProps } from 'react';
import { useCallback } from 'react';

type HTMLSelectPropsOriginal = ComponentProps<typeof HTMLSelect>;

export type BpSelectProps = Readonly<{
  onValueChange: (value: string) => void;
  options: Readonly<HTMLSelectPropsOriginal['options']>;
}> &
  StrictOmit<HTMLSelectPropsOriginal, 'options'>;

export const BpSelect = memoNamed<BpSelectProps>(
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
