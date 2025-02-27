import {
  source,
  type Observable,
  type SourceObservable,
} from '@noshiro/syncflow';
import { useCallback, useMemo } from 'react';

export const useVoidEventObservable = (): [Observable<void>, () => void] => {
  const src$ = useMemo<SourceObservable<undefined>>(source, []);

  const emitter = useCallback(
    () => {
      src$.next(undefined);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [src$, emitter];
};

export const useEventObservable = <A,>(): [
  Observable<A>,
  (value: A) => void,
] => {
  const src$ = useMemo<SourceObservable<A>>(source, []);

  const emitter = useCallback(
    (value: A) => {
      src$.next(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [src$, emitter];
};
