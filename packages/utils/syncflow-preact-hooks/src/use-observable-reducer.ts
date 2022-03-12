import type { InitializedObservable } from '@noshiro/syncflow';
import { scan, source } from '@noshiro/syncflow';
import { useCallback, useMemo } from 'preact/compat';
import { useObservable } from './use-observable';

export const useObservableReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [InitializedObservable<S>, (action: A) => void] => {
  const action$ = useMemo(() => source<A>(), []);

  const state$ = useObservable<S>(() =>
    action$.chain(scan(reducer, initialState))
  );

  const dispatch = useCallback((action: A) => {
    action$.next(action);
  }, []);

  return [state$, dispatch];
};
