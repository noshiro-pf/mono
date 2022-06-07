import { Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

export const LockButton = memoNamed<
  Readonly<{
    passwordIsOpen: boolean;
    disabled: boolean;
    onLockClick: () => void;
  }>
>('LockButton', ({ passwordIsOpen, disabled, onLockClick }) => (
  <Tooltip2
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
  </Tooltip2>
));
