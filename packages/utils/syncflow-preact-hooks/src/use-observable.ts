import { useState } from '@noshiro/preact-utils';
import type { InitializedObservable, Observable } from '@noshiro/syncflow';
import { Maybe } from '@noshiro/ts-utils';
import { useEffect, useMemo } from 'preact/hooks';

export function useObservable<A>(
  createObservable$: () => InitializedObservable<A>
): InitializedObservable<A>;
export function useObservable<A>(
  createObservable$: () => Observable<A>
): Observable<A>;
export function useObservable<A>(
  createObservable$: () => Observable<A>
): Observable<A> {
  const s = useMemo(createObservable$, []);
  useEffect(
    () => () => {
      s.complete();
    },
    []
  );
  return s;
}

export const useObservableEffect = <A>(
  observable$: Observable<A>,
  subscriptionFn: (v: A) => void
): void => {
  useEffect(() => {
    const s = observable$.subscribe(subscriptionFn);
    return () => {
      s.unsubscribe();
    };
  }, []);
};

// Wraps the value with an object to avoid setState's update behavior when T is function type.

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B
): A | B;
export function useObservableValue<A>(observable$: InitializedObservable<A>): A;
export function useObservableValue<A>(
  observable$: Observable<A>
): A | undefined;
export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B
): A | B | undefined {
  const { state, setState } = useState<{ value: A | B | undefined }>({
    value: Maybe.unwrap(observable$.currentValue) ?? initialValue,
  });
  useObservableEffect(observable$, (value) => {
    setState({ value });
  });
  return state.value;
}
