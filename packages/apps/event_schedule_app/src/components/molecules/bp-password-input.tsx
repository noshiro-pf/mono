import { Button } from '@blueprintjs/core';
import { memoNamed, useToggleState } from '@mono/react-utils';
import React from 'react';
import { BpInput } from '../atoms/blueprint-js-wrapper/bp-input';

export const BpPasswordInput = memoNamed<{
  password: string;
  onPasswordChange: (value: string) => void;
}>('BpPasswordInput', ({ password, onPasswordChange }) => {
  const [showPassword, onToggleVisibilityClick] = useToggleState(false);

  return (
    <BpInput
      type={showPassword ? 'text' : 'password'}
      value={password}
      onValueChange={onPasswordChange}
      rightElement={
        <Button
          icon={showPassword ? 'eye-open' : 'eye-off'}
          minimal={true}
          onClick={onToggleVisibilityClick}
        />
      }
    />
  );
});
