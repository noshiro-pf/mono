import { Checkbox } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

export type BpCheckboxProps = Omit<CheckboxPropsOriginal, 'checked'> &
  Readonly<{
    checked: boolean;
    onCheck: (checked: boolean) => void;
  }>;

type CheckboxPropsOriginal = React.ComponentProps<typeof Checkbox>;

export const BpCheckbox = memoNamed<BpCheckboxProps>(
  'BpCheckbox',
  ({ checked, onCheck, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.FormEvent<HTMLInputElement>) => {
        onCheck(ev.currentTarget.checked);
      },
      [onCheck],
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Checkbox {...props} checked={checked} onChange={onChangeHandler} />;
  },
);
