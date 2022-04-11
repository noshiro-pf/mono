import { Button } from '@blueprintjs/core';
import type { BpInputProps } from './bp-input';
import { BpInput } from './bp-input';

export type BpPasswordInputProps = BpInputProps &
  Readonly<{
    password: string;
    onPasswordChange: (value: string) => void;
    disabled: boolean;
  }>;

export const BpPasswordInput = memoNamed<BpPasswordInputProps>(
  'BpPasswordInput',
  (props) => {
    const { state: passwordIsOpen, toggleState: onToggleVisibilityClick } =
      useBoolState(false);

    return (
      <BpInput
        disabled={props.disabled}
        rightElement={
          <Button
            icon={passwordIsOpen ? 'eye-open' : 'eye-off'}
            minimal={true}
            onClick={onToggleVisibilityClick}
          />
        }
        type={passwordIsOpen ? 'text' : 'password'}
        value={props.password}
        onValueChange={props.onPasswordChange}
      />
    );
  }
);
