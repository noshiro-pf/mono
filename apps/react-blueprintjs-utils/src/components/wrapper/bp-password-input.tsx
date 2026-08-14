import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';
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
    const [passwordIsOpen, { toggleState: onToggleVisibilityClick }] =
      useBoolState(false);

    const rightElement = React.useMemo(
      () => (
        <BpButton
          icon={passwordIsOpen ? 'eye-open' : 'eye-off'}
          variant={'minimal'}
          onClick={onToggleVisibilityClick}
        />
      ),
      [onToggleVisibilityClick, passwordIsOpen],
    );

    return (
      <BpInput
        disabled={disabled}
        rightElement={rightElement}
        type={passwordIsOpen ? 'text' : 'password'}
        value={password}
        onValueChange={onPasswordChange}
      />
    );
  },
);
