import * as React from 'react';
import type { InitializedObservable } from 'synstate';

/**
 * The current value of `observable`, re-rendering when it changes. The server
 * snapshot is the same value, so that a router on a memory browser renders on a
 * server too. synstate-react-hooks' `useObservableValue` does the same; this
 * package keeps its own few lines rather than depend on that package for one
 * hook.
 */
export const useObservableValue = <A,>(
  observable: InitializedObservable<A>,
): A => {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable.subscribe(onStoreChange);

      return unsubscribe;
    },
    [observable],
  );

  const getSnapshot = React.useCallback(
    (): A => observable.getSnapshot().value,
    [observable],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
