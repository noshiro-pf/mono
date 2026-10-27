import { onScopeDispose, type Observable } from 'synstate';
import type { StrictPick } from 'ts-type-forge';
import { closeOnBackdropClick } from './close-on-backdrop-click.mjs';
import { createAfterUpdate, subscribeInScope } from './scope-effects.mjs';

/**
 * Has a native `<dialog>` follow a store: opened modal while `isOpen` says
 * so of `source`'s value, and closed otherwise. A modal dialog is opened by
 * a call, not an attribute, so this is called from the element's `ref`, and
 * listens for as long as the component that made it is mounted. A click on
 * the backdrop calls `close`, as Escape does through the element's
 * `onCancel`.
 *
 * Opened and closed once the update has finished: the content the store
 * just asked for is then mounted, the element is in the document, and the
 * focus that moves with it changes no state while another is propagating.
 */
export const followModal = <A,>(
  dialog: HTMLElement &
    Readonly<StrictPick<HTMLDialogElement, 'close' | 'open' | 'showModal'>>,
  source: Observable<A>,
  isOpen: (value: A) => boolean,
  close: () => void,
  hooks?: Readonly<{
    /** After it is opened. */
    opened?: () => void;
    /** After it is closed. */
    closed?: () => void;
  }>,
): void => {
  onScopeDispose(closeOnBackdropClick(dialog, close));

  const afterUpdate = createAfterUpdate();

  const mut_wanted: { open: boolean } = { open: false };

  subscribeInScope(source, (value) => {
    mut_wanted.open = isOpen(value);

    afterUpdate(() => {
      if (mut_wanted.open && !dialog.open && dialog.isConnected) {
        dialog.showModal();

        hooks?.opened?.();
      } else if (!mut_wanted.open && dialog.open) {
        dialog.close();

        hooks?.closed?.();
      }
    });
  });
};
