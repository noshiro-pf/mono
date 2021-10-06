import type { InitializedObservable, Observable } from '@noshiro/syncflow';
import { scan, source, withInitialValue } from '@noshiro/syncflow';
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
): [InitializedObservable<A>, (v: A) => void] => {
  const src$ = useMemo(() => source<A>(), []);
  const state$ = useStream(() => src$.chain(withInitialValue(initialValue)));

  const setter = useCallback((v: A) => {
    src$.next(v);
  }, []);

  return [state$, setter];
};

export const useReducerAsStream = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [InitializedObservable<S>, (action: A) => void] => {
  const action$ = useMemo(() => source<A>(), []);

  const state$ = useStream<S>(() => action$.chain(scan(reducer, initialState)));

  const dispatch = useCallback((action: A) => {
    action$.next(action);
  }, []);

  return [state$, dispatch];
};

export const useUpdaterAsStream = <S>(
  initialState: S
): [InitializedObservable<S>, (updateFn: (prev: S) => S) => void] => {
  const [state$, dispatch] = useReducerAsStream<S, (prev: S) => S>(
    (state: S, updateFn: (prev: S) => S): S => updateFn(state),
    initialState
  );

  const updater = useCallback((updateFn: (prev: S) => S) => {
    dispatch(updateFn);
  }, []);

  return [state$, updater];
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
