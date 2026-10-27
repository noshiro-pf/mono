import { onScopeDispose, type InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';

/**
 * A `ref` that keeps a `<dialog>` opened modal while `open$` is `true`, for
 * as long as the scope it is mounted in lives.
 *
 * A modal dialog is opened by a call, not an attribute, so the element
 * follows the store rather than a prop. The `ref` is called before the
 * element is in the document, where `showModal` throws, so a store that
 * starts open is followed once the mount is over.
 */
export const followOpen =
  (open$: InitializedObservable<boolean>): DialogRef =>
  (dialog) => {
    const follow = (shown: boolean): void => {
      if (shown && !dialog.open) {
        dialog.showModal();
      } else if (!shown && dialog.open) {
        dialog.close();
      }
    };

    const subscription = open$.subscribe((shown) => {
      if (dialog.isConnected) {
        follow(shown);
      } else {
        queueMicrotask(() => {
          follow(open$.getSnapshot().value);
        });
      }
    });

    onScopeDispose(() => {
      subscription.unsubscribe();
    });
  };

type DialogRef = NonNullable<JSX.IntrinsicElements['dialog']['ref']>;
