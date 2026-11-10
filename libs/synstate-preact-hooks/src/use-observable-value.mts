import * as PreactCompat from 'preact/compat';
import type {
  InitializedObservable,
  Observable,
  ObservableValue,
} from 'synstate';
import { Optional } from 'ts-data-forge';

/**
 * The current value of `observable$`, re-rendering the component when it emits
 * a value different (`Object.is`) from the one it shows.
 * Pass an Observable that keeps its identity across renders (made outside the
 * component, or memoized): a different one moves the subscription to it, so one
 * built during render is subscribed again on every render.
 */
export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B,
): A | B;

/**
 * The current value of `observable$`, re-rendering the component when it emits
 * a value different (`Object.is`) from the one it shows.
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

  // The value itself rather than synstate's `Optional`, which is a new object
  // on every emission, so that Preact renders nothing for an emission equal to
  // the current value.
  const getSnapshot = PreactCompat.useCallback((): A | typeof NO_VALUE => {
    const snapshot = observable$.getSnapshot();

    return Optional.isSome(snapshot) ? snapshot.value : NO_VALUE;
  }, [observable$]);

  const value = PreactCompat.useSyncExternalStore(subscribe, getSnapshot);

  return value === NO_VALUE ? initialValue : value;
}

/** What `getSnapshot` returns while the observable holds no value. */
const NO_VALUE: unique symbol = Symbol('no value');
