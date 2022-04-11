import { Checkbox } from '@blueprintjs/core';
import type { ComponentProps } from 'react';

type CheckboxPropsOriginal = ComponentProps<typeof Checkbox>;

export type BpCheckboxProps = Readonly<{
  checked: boolean;
  onCheck: (checked: boolean) => void;
}> &
  StrictOmit<CheckboxPropsOriginal, 'checked'>;

export const BpCheckbox = memoNamed<BpCheckboxProps>(
  'BpCheckbox',
  ({ checked, onCheck, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: FormEvent<HTMLInputElement>) => {
        onCheck(ev.currentTarget.checked);
      },
      [onCheck]
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Checkbox checked={checked} onChange={onChangeHandler} {...props} />;
  }
);
