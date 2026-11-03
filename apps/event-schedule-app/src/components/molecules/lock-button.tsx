import { Button, Tooltip } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{
  passwordIsOpen: Bindable<boolean>;
  disabled: Bindable<boolean>;
  onLockClick: () => void;
}>;

/** Shows or hides the password, inside its input. */
export const LockButton = ({
  passwordIsOpen,
  disabled,
  onLockClick,
}: Props): JSX.Element => (
  <Tooltip
    content={mapBindable(
      passwordIsOpen,
      (open) => `${open ? 'Hide' : 'Show'} Password`,
    )}
    disabled={disabled}
  >
    <Button
      disabled={disabled}
      icon={mapBindable(passwordIsOpen, (open) => (open ? 'unlock' : 'lock'))}
      intent={'warning'}
      variant={constant('minimal')}
      onClick={onLockClick}
    />
  </Tooltip>
);
