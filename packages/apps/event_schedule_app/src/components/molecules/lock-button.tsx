import { Button, Tooltip } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';

export const LockButton = memoNamed<
  Readonly<{
    passwordIsOpen: boolean;
    disabled: boolean;
    onLockClick: () => void;
  }>
>('LockButton', ({ passwordIsOpen, disabled, onLockClick }) => (
  <Tooltip
    content={`${passwordIsOpen ? 'Hide' : 'Show'} Password`}
    disabled={disabled}
  >
    <Button
      disabled={disabled}
      icon={passwordIsOpen ? 'unlock' : 'lock'}
      intent={'warning'}
      minimal={true}
      onClick={onLockClick}
    />
  </Tooltip>
));
