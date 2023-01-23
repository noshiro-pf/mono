import { HTMLSelect, type HTMLSelectProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback, type ChangeEvent, type ComponentProps } from 'react';

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
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: ChangeEvent<HTMLSelectElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    return (
      <HTMLSelect
        options={options as HTMLSelectProps['options']}
        value={value}
        onChange={onChangeHandler}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);
