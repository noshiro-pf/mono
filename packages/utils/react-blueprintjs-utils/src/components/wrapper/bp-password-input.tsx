import { memoNamed, useBoolState } from '@noshiro/react-utils';
import { BpButton } from './bp-button.js';
import { BpInput, type BpInputProps } from './bp-input.js';

export type BpPasswordInputProps = BpInputProps &
  Readonly<{
    password: string;
    onPasswordChange: (value: string) => void;
    disabled: boolean;
  }>;

export const BpPasswordInput = memoNamed<BpPasswordInputProps>(
  'BpPasswordInput',
  ({ disabled, onPasswordChange, password }) => {
    const { state: passwordIsOpen, toggleState: onToggleVisibilityClick } =
      useBoolState(false);

    return (
      <BpInput
        disabled={disabled}
        rightElement={
          <BpButton
            icon={passwordIsOpen ? 'eye-open' : 'eye-off'}
            minimal={true}
            onClick={onToggleVisibilityClick}
          />
        }
        type={passwordIsOpen ? 'text' : 'password'}
        value={password}
        onValueChange={onPasswordChange}
      />
    );
  },
);
