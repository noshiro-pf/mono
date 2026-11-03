import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { intentClass } from '../internal/index.mjs';
import { Button } from './button.js';
import { Dialog } from './dialog.js';
import { Icon, type IconName20 } from './icon.js';
import type { Intent } from './intent.mjs';

type Props = Readonly<{
  isOpen: Bindable<boolean>;
  /** The message. */
  children: Child;
  /** Drawn at 40px before the message, in the intent's colour. */
  icon?: IconName20;
  /** Of the icon and the confirm button. */
  intent?: Intent;
  /** `OK` by default, as Blueprint's. */
  confirmButtonText?: Bindable<string>;
  /** With none, or an empty one, there is no cancel button. */
  cancelButtonText?: Bindable<string>;
  /** The confirm button spins, and both buttons are disabled meanwhile. */
  loading?: Bindable<boolean>;
  onConfirm?: (event: Event) => void;
  /** Called by the cancel button, and by Escape and the backdrop where they may. */
  onCancel?: (event: Event) => void;
  /** Called after either, with whether it was confirmed. */
  onClose?: (confirmed: boolean, event: Event) => void;
  /** Escape cancels; off by default, as Blueprint's. */
  canEscapeKeyCancel?: boolean;
  /** A press on the backdrop cancels; off by default, as Blueprint's. */
  canOutsideClickCancel?: boolean;
  /** Classes on `div.bp6-dialog`, after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `Alert`: a `Dialog` with no header, its role `alertdialog`, an
 * icon and a message, and a footer with the confirm button and an optional
 * cancel button.
 */
export const Alert = ({
  isOpen,
  children,
  icon,
  intent = 'none',
  confirmButtonText = constant('OK'),
  cancelButtonText = constant(''),
  loading,
  onConfirm,
  onCancel,
  onClose,
  canEscapeKeyCancel = false,
  canOutsideClickCancel = false,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const answer =
    (confirmed: boolean) =>
    (event: Event): void => {
      (confirmed ? onConfirm : onCancel)?.(event);

      onClose?.(confirmed, event);
    };

  return (
    <Dialog
      canEscapeKeyClose={canEscapeKeyCancel}
      canOutsideClickClose={canOutsideClickCancel}
      class={className === undefined ? 'bp6-alert' : `bp6-alert ${className}`}
      isOpen={isOpen}
      role={'alertdialog'}
      onClose={answer(false)}
      {...(e2e === undefined ? {} : { 'data-e2e': e2e })}
    >
      <div class={constant('bp6-alert-body')}>
        {icon === undefined ? (
          []
        ) : (
          <Icon class={intentClass(intent)} icon={icon} size={40} />
        )}
        <div class={constant('bp6-alert-contents')}>{children}</div>
      </div>
      <div class={constant('bp6-alert-footer')}>
        <Button
          intent={intent}
          loading={loading}
          text={confirmButtonText}
          onClick={answer(true)}
        />
        {/* Blueprint's `cancelButtonText && …`: none for an empty one either. */}
        <If
          cond={mapBindable(cancelButtonText, (text) => text !== '')}
          then={
            <Button
              disabled={loading}
              text={cancelButtonText}
              onClick={answer(false)}
            />
          }
        />
      </div>
    </Dialog>
  );
};
