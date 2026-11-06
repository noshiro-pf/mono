import * as PreactCompat from 'preact/compat';
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
  const subscribe = PreactCompat.useCallback(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable$.subscribe(onStoreChange);

      return unsubscribe;
    },
    [observable$],
  );

  const getSnapshot = PreactCompat.useCallback(
    () => observable$.getSnapshot(),
    [observable$],
  );

  const value = PreactCompat.useSyncExternalStore(subscribe, getSnapshot);

  return Optional.unwrapOr(value, initialValue);
}
