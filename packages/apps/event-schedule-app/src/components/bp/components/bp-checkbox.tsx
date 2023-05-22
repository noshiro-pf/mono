import { Checkbox } from '@blueprintjs/core';

type CheckboxPropsOriginal = React.ComponentProps<typeof Checkbox>;

export type BpCheckboxProps = Omit<CheckboxPropsOriginal, 'checked'> &
  Readonly<{
    checked: boolean;
    onCheck: (checked: boolean) => void;
  }>;

export const BpCheckbox = memoNamed<BpCheckboxProps>(
  'BpCheckbox',
  ({ checked, onCheck, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.FormEvent<HTMLInputElement>) => {
        onCheck(ev.currentTarget.checked);
      },
      [onCheck]
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Checkbox checked={checked} onChange={onChangeHandler} {...props} />;
  }
);
