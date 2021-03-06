import { Checkbox } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ComponentProps, FormEvent } from 'react';
import { useCallback } from 'react';

type CheckboxPropsOriginal = ComponentProps<typeof Checkbox>;

export type BpCheckboxProps = CheckboxPropsOriginal &
  Readonly<{
    checked: boolean;
    onCheck: (checked: boolean) => void;
  }>;

export const BpCheckbox = memoNamed<BpCheckboxProps>(
  'BpCheckbox',
  ({ checked, onCheck, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
      (ev: FormEvent<HTMLInputElement>) => {
        onCheck(ev.currentTarget.checked);
      },
      [onCheck]
    );

    return <Checkbox checked={checked} onChange={onChangeHandler} {...props} />;
  }
);
