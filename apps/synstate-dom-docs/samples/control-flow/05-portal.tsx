import { createBooleanState } from 'synstate';
import { constant, If, Portal, type JSX } from 'synstate-dom';

const [isOpen$, { setFalse: close }] = createBooleanState(false);

// The dialog is mounted into `document.body`, out of any ancestor's
// `overflow: hidden`, but it belongs to the `If` branch: closing it removes
// the dialog too.
export const Modal = (): JSX.Element => (
  <If
    cond={isOpen$}
    then={
      <Portal target={document.body}>
        <div role={constant('dialog')}>
          <button type={constant('button')} onClick={close}>
            {constant('Close')}
          </button>
        </div>
      </Portal>
    }
  />
);
