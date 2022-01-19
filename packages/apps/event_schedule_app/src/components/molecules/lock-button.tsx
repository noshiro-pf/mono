import { Button, Tooltip } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';

export const LockButton = memoNamed<
  Readonly<{
    showPassword: boolean;
    disabled: boolean;
    onLockClick: () => void;
  }>
>('LockButton', ({ showPassword, disabled, onLockClick }) => (
  <Tooltip
    content={`${showPassword ? 'Hide' : 'Show'} Password`}
    disabled={disabled}
  >
    <Button
      disabled={disabled}
      icon={showPassword ? 'unlock' : 'lock'}
      intent={'warning'}
      minimal={true}
      onClick={onLockClick}
    />
  </Tooltip>
));
