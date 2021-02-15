import { useCallback, useEffect, useRef, useState } from 'preact/compat';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';

export const useStream = <T>(stream$: Observable<T>): Observable<T> => {
  const ref = useRef(stream$.pipe(shareReplay(1)));
  return ref.current;
};

export const useDataStream = <T>(
  initialValue: T,
  stream$: Observable<T>
): Observable<T> =>
  useStream<T>(
    stream$.pipe(startWith(initialValue), distinctUntilChanged(Object.is))
  );

export const useStreamEffect = <T>(
  stream$: Observable<T>,
  subscriptionFn: (v: T) => void
): void => {
  const ref = useRef({ stream$, subscriptionFn });
  useEffect(() => {
    const s = ref.current.stream$.subscribe(ref.current.subscriptionFn);
    return () => {
      s.unsubscribe();
    };
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
  return state.value ?? initialValue;
}

export const useVoidEventAsStream = (): [Observable<undefined>, () => void] => {
  const src$ = useRef(new Subject<undefined>());

  const emitter = useCallback(() => {
    src$.current.next();
  }, []);

  const event$ = useStream<undefined>(src$.current.asObservable());
  return [event$, emitter];
};

export const useEventAsStream = <T>(): [Observable<T>, (value: T) => void] => {
  const src$ = useRef(new Subject<T>());

  const emitter = useCallback((value: T) => {
    src$.current.next(value);
  }, []);

  const event$ = useStream<T>(src$.current.asObservable());
  return [event$, emitter];
};

export const useStateAsStream = <T>(
  initialValue: T
): [Observable<T>, (v: T) => void] => {
  const src$ = useRef(new BehaviorSubject<T>(initialValue));

  const setter = useCallback((v: T) => {
    src$.current.next(v);
  }, []);

  const value$ = useStream<T>(src$.current.asObservable());

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
