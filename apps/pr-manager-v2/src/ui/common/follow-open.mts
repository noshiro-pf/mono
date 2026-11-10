import { onScopeDispose, type InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';

/**
 * A `ref` for a native `<dialog>` that opens it modal and closes it as `open`
 * says. A dialog not yet in the document is opened once it is.
 */
export const followOpen =
  (open: InitializedObservable<boolean>): DialogRef =>
  (dialog) => {
    const follow = (shown: boolean): void => {
      if (shown && !dialog.open) {
        dialog.showModal();
      } else if (!shown && dialog.open) {
        dialog.close();
      }
    };

    const subscription = open.subscribe((shown) => {
      if (dialog.isConnected) {
        follow(shown);
      } else {
        queueMicrotask(() => {
          follow(open.getSnapshot().value);
        });
      }
    });

    onScopeDispose(() => {
      subscription.unsubscribe();
    });
  };

type DialogRef = NonNullable<JSX.IntrinsicElements['dialog']['ref']>;
