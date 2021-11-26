/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button } from '@blueprintjs/core';
import { memoNamed, useToggleState } from '@noshiro/react-utils';
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
        disabled={props.disabled}
        rightElement={
          <Button
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
