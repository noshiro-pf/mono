import * as React from 'react';
import type { InitializedObservable, Observable } from 'synstate';
import { Optional } from 'ts-data-forge';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

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
export function useObservableValue<A>(observable$: InitializedObservable<A>): A;

/**
 * The current value of `observable$`, re-rendering the component when it emits
 * a value different (`Object.is`) from the one it shows.
 * Pass an Observable that keeps its identity across renders (made outside the
 * component, or memoized): a different one moves the subscription to it, so one
 * built during render is subscribed again on every render.
 */
export function useObservableValue<A>(
  observable$: Observable<A>,
): A | undefined;

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B,
): A | B | undefined {
  // React's published `useSyncExternalStore` for React 16.8 and 17, which calls
  // React's own on 18 and later. It subscribes again whenever `subscribe` is a
  // new function, so that is kept for as long as the observable is (#3144). A
  // new `getSnapshot` does not resubscribe; it is memoized alongside only to
  // read the same observable.
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable$.subscribe(onStoreChange);

      return unsubscribe;
    },
    [observable$],
  );

  // The value itself, which is what the hook returns, or `NO_VALUE` while there
  // is none. Equal values give equal snapshots under `Object.is`, so React
  // renders nothing for an emission equal to the current value.
  const getSnapshot = React.useCallback(
    (): A | typeof NO_VALUE =>
      Optional.unwrapOr(observable$.getSnapshot(), NO_VALUE),
    [observable$],
  );

  // `getSnapshot` doubles as `getServerSnapshot`, as in synstate-react-hooks
  // (#3639): an observable's value can be read synchronously on the server too.
  // Only React 18 and later read it; the shim before 18 calls `getSnapshot`
  // where there is no DOM and while hydrating.
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return value === NO_VALUE ? initialValue : value;
}

/** What `getSnapshot` returns while the observable holds no value. */
const NO_VALUE: unique symbol = Symbol('no value');
