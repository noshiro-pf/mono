import { memoNamed, useBoolState } from '@noshiro/react-utils';
import { BpButton } from './bp-button';
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
    const { state: showPassword, toggleState: onToggleVisibilityClick } =
      useBoolState(false);

    return (
      <BpInput
        disabled={props.disabled}
        rightElement={
          <BpButton
            icon={showPassword ? 'eye-open' : 'eye-off'}
            minimal={true}
            onClick={onToggleVisibilityClick}
          />
        }
        type={showPassword ? 'text' : 'password'}
        value={props.password}
        onValueChange={props.onPasswordChange}
      />
    );
  }
);
