import * as React from 'react';
import { type InitializedObservable, type Observable } from 'synstate';
import { Optional } from 'ts-data-forge';

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B,
): A | B;

export function useObservableValue<A>(observable$: InitializedObservable<A>): A;

export function useObservableValue<A>(
  observable$: Observable<A>,
): A | undefined;

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B,
): A | B;

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B,
): A | B | undefined {
  const [value, setValue] = React.useState<A | B | undefined>(() =>
    Optional.unwrapOr(observable$.getSnapshot(), initialValue),
  );

  React.useEffect(() => {
    const { unsubscribe } = observable$.subscribe((v) => {
      setValue(v);
    });

    return unsubscribe;
  }, [observable$]);

  return value;
}
