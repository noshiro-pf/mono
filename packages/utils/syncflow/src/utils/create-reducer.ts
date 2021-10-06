import type { InitializedObservable } from '../core';
import { scan, source } from '../core';

export const createReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [InitializedObservable<S>, (action: A) => void] => {
  const action$ = source<A>();

  const state$ = action$.chain(scan(reducer, initialState));

  const dispatch = (action: A): void => {
    action$.next(action);
  };

  return [state$, dispatch];
};
