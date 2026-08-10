import { type InitializedObservable, type Observable } from '@noshiro/syncflow';
import { Maybe } from '@noshiro/ts-utils';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

export function useObservable<A>(
  createObservable$: () => InitializedObservable<A>,
): InitializedObservable<A>;
export function useObservable<A>(
  createObservable$: () => Observable<A>,
): Observable<A>;
export function useObservable<A>(
  createObservable$: () => Observable<A>,
): Observable<A> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const s = useMemo(createObservable$, []);

  useEffect(
    () => () => {
      s.complete();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return s;
}

export const useObservableEffect = <A,>(
  observable$: Observable<A>,
  subscriptionFn: (v: A) => void,
): void => {
  useEffect(() => {
    const s = observable$.subscribe(subscriptionFn);
    return () => {
      s.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

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
  initialValue?: B,
): A | B | undefined {
  const value = useSyncExternalStore(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable$.subscribe(onStoreChange);
      return unsubscribe;
    },
    () => observable$.getSnapshot(),
  );

  return Maybe.unwrapOr(value, initialValue);
}
