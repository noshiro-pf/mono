import type { InitializedObservable, Observable } from '@noshiro/syncflow';
import { Option } from '@noshiro/ts-utils';
import { useEffect, useMemo, useState } from 'preact/compat';

export function useStream<A>(
  createStream$: () => InitializedObservable<A>
): InitializedObservable<A>;
export function useStream<A>(createStream$: () => Observable<A>): Observable<A>;
export function useStream<A>(
  createStream$: () => Observable<A>
): Observable<A> {
  const s = useMemo(createStream$, []);
  useEffect(
    () => () => {
      s.complete();
    },
    []
  );
  return s;
}

export const useStreamEffect = <A>(
  stream$: Observable<A>,
  subscriptionFn: (v: A) => void
): void => {
  useEffect(() => {
    const s = stream$.subscribe(subscriptionFn);
    return () => {
      s.unsubscribe();
    };
  }, []);
};

// Wraps the value with an object to avoid setState's update behavior when T is function type.

export function useStreamValue<A, B = A>(
  stream$: Observable<A>,
  initialValue: B
): A | B;
export function useStreamValue<A>(stream$: InitializedObservable<A>): A;
export function useStreamValue<A>(stream$: Observable<A>): A | undefined;
export function useStreamValue<A, B = A>(
  stream$: Observable<A>,
  initialValue?: B
): A | B | undefined {
  const [state, setState] = useState<{ value: A | B | undefined }>({
    value: Option.unwrap(stream$.currentValue) ?? initialValue,
  });
  useStreamEffect(stream$, (value) => {
    setState({ value });
  });
  return state.value;
}
