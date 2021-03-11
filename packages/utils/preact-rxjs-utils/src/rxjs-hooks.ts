import { useCallback, useEffect, useMemo, useState } from 'preact/compat';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';

export function useStream<A>(
  createStream$: () => Observable<A>
): Observable<A> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const s = useMemo(() => createStream$().pipe(shareReplay(1)), []);
  return s;
}

export const useDataStream = <A>(
  initialValue: A,
  createStream$: () => Observable<A>
): Observable<A> =>
  useStream<A>(() =>
    createStream$().pipe(
      startWith(initialValue),
      distinctUntilChanged<A>(Object.is)
    )
  );

export const useStreamEffect = <T>(
  stream$: Observable<T>,
  subscriptionFn: (v: T) => void
): void => {
  useEffect(() => {
    const s = stream$.subscribe(subscriptionFn);
    return () => {
      s.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

// Wraps the value with an object to avoid setState's update behavior when T is function type.
export function useStreamValue<T>(stream$: Observable<T>, initialValue: T): T;
export function useStreamValue<T>(stream$: Observable<T>): T | undefined;
export function useStreamValue<T>(
  stream$: Observable<T>,
  initialValue?: T
): T | undefined {
  const [state, setState] = useState<{ value: T | undefined }>({
    value: initialValue,
  });
  useStreamEffect(stream$, (value) => {
    setState({ value });
  });
  return state.value;
}

export const useVoidEventAsStream = (): [Observable<undefined>, () => void] => {
  const src$ = useMemo(() => new Subject<undefined>(), []);

  const emitter = useCallback(() => {
    src$.next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const event$ = useStream<undefined>(() => src$.asObservable());
  return [event$, emitter];
};

export const useEventAsStream = <T>(): [Observable<T>, (value: T) => void] => {
  const src$ = useMemo(() => new Subject<T>(), []);

  const emitter = useCallback((value: T) => {
    src$.next(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const event$ = useStream<T>(() => src$.asObservable());
  return [event$, emitter];
};

export const useStateAsStream = <T>(
  initialValue: T
): [Observable<T>, (v: T) => void] => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const src$ = useMemo(() => new BehaviorSubject<T>(initialValue), []);

  const setter = useCallback((v: T) => {
    src$.next(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value$ = useStream<T>(() => src$.asObservable());

  return [value$, setter];
};

export const useChangeValueEffect = <T>(
  input: T,
  callback: (v: T) => void
): void => {
  useEffect(() => {
    callback(input);
  }, [input, callback]);
};

export const useValueAsStream = <T>(input: T): Observable<T> => {
  const [value$, setValue] = useStateAsStream<T>(input);
  useChangeValueEffect(input, setValue);
  return value$;
};
