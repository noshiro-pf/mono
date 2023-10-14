import {
  source,
  withInitialValue,
  type InitializedObservable,
  type SourceObservable,
} from '@noshiro/syncflow';
import { useCallback, useMemo } from 'react';
import { useObservable } from './use-observable';

export const useObservableReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): [InitializedObservable<S>, (action: A) => S] => {
  const source$ = useMemo<SourceObservable<S>>(source, []);

  const state$ = useObservable(() =>
    source$.chain(withInitialValue(initialState)),
  );

  const dispatch = useCallback((action: A): S => {
    const nextState = reducer(state$.snapshot.value, action);
    source$.next(nextState);
    return nextState;
  }, []);

  return [state$, dispatch];
};
