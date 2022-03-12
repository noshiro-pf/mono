import type { Observable } from '@noshiro/syncflow';
import { source } from '@noshiro/syncflow';
import { useCallback, useMemo } from 'react';

export const useVoidEventObservable = (): [Observable<void>, () => void] => {
  const src$ = useMemo(() => source<undefined>(), []);

  const emitter = useCallback(() => {
    src$.next(undefined);
  }, []);

  return [src$, emitter];
};

export const useEventObservable = <A>(): [
  Observable<A>,
  (value: A) => void
] => {
  const src$ = useMemo(() => source<A>(), []);

  const emitter = useCallback((value: A) => {
    src$.next(value);
  }, []);

  return [src$, emitter];
};
