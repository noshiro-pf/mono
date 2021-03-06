import { memoNamed, useToggleState } from '@noshiro/react-utils';
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
    const [showPassword, onToggleVisibilityClick] = useToggleState(false);

    return (
      <BpInput
        type={showPassword ? 'text' : 'password'}
        value={props.password}
        onValueChange={props.onPasswordChange}
        disabled={props.disabled}
        rightElement={
          <BpButton
            icon={showPassword ? 'eye-open' : 'eye-off'}
            minimal={true}
            onClick={onToggleVisibilityClick}
          />
        }
      />
    );
  }
);
