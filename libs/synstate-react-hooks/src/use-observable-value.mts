import * as React from 'react';
import type {
  InitializedObservable,
  Observable,
  ObservableValue,
} from 'synstate';
import { Optional } from 'ts-data-forge';

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B,
): A | B;

export function useObservableValue<O extends Observable<unknown>>(
  observable$: O,
): O extends InitializedObservable<infer A>
  ? A
  : ObservableValue<O> | undefined;

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B,
): A | B | undefined {
  const value = React.useSyncExternalStore(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable$.subscribe(onStoreChange);

      return unsubscribe;
    },
    () => observable$.getSnapshot(),
  );

  return Optional.unwrapOr(value, initialValue);
}
