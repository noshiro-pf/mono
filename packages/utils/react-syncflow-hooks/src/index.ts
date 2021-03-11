import { Observable, source } from '@noshiro/syncflow';
import { Option } from '@noshiro/ts-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

export const useVoidEventAsStream = (): [Observable<undefined>, () => void] => {
  const src$ = useMemo(() => source<undefined>(), []);

  const emitter = useCallback(() => {
    src$.next(undefined);
  }, []);

  return [src$, emitter];
};

export const useEventAsStream = <A>(): [Observable<A>, (value: A) => void] => {
  const src$ = useMemo(() => source<A>(), []);

  const emitter = useCallback((value: A) => {
    src$.next(value);
  }, []);

  return [src$, emitter];
};

export const useStateAsStream = <A>(
  initialValue: A
): [Observable<A>, (v: A) => void] => {
  const value$ = useMemo(() => source<A>(), []);

  useEffect(() => {
    value$.next(initialValue);
  }, []);

  const setter = useCallback((v: A) => {
    value$.next(v);
  }, []);

  return [value$, setter];
};

export const useChangeValueEffect = <A>(
  input: A,
  callback: (v: A) => void
): void => {
  useEffect(() => {
    callback(input);
  }, [input, callback]);
};

export const useValueAsStream = <A>(input: A): Observable<A> => {
  const [value$, setValue] = useStateAsStream<A>(input);
  useChangeValueEffect(input, setValue);
  return value$;
};
