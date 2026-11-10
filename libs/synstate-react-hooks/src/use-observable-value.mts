import * as React from 'react';
import type {
  InitializedObservable,
  Observable,
  ObservableValue,
} from 'synstate';
import { Optional } from 'ts-data-forge';

/**
 * The current value of `observable$`, re-rendering the component when it emits.
 * Pass an Observable that keeps its identity across renders (made outside the
 * component, or memoized): a different one moves the subscription to it, so one
 * built during render is subscribed again on every render.
 */
export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B,
): A | B;

/**
 * The current value of `observable$`, re-rendering the component when it emits.
 * Pass an Observable that keeps its identity across renders (made outside the
 * component, or memoized): a different one moves the subscription to it, so one
 * built during render is subscribed again on every render.
 */
export function useObservableValue<O extends Observable<unknown>>(
  observable$: O,
): O extends InitializedObservable<infer A>
  ? A
  : ObservableValue<O> | undefined;

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B,
): A | B | undefined {
  // `useSyncExternalStore` subscribes again whenever `subscribe` is a new
  // function, so it is kept for as long as the observable is (#3144).
  // A new `getSnapshot` does not resubscribe; it is memoized alongside only to
  // read the same observable.
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable$.subscribe(onStoreChange);

      return unsubscribe;
    },
    [observable$],
  );

  const getSnapshot = React.useCallback(
    () => observable$.getSnapshot(),
    [observable$],
  );

  // `getSnapshot` doubles as `getServerSnapshot`, which server rendering and
  // hydration require: an observable's value can be read synchronously on the
  // server too (#3639).
  const value = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return Optional.unwrapOr(value, initialValue);
}
