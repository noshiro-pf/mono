import {
  setInitialValue,
  source,
  type InitializedObservable,
  type SourceObservable,
} from '@noshiro/syncflow';
import { useCallback, useMemo } from 'react';
import { useObservable } from './use-observable.mjs';

/** `reducer` 及び `initialState` は初期値でのみ評価される。 動的に変更しても state には反映されないので注意。 */
export const useObservableReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): readonly [InitializedObservable<S>, (action: A) => S] => {
  const source$ = useMemo<SourceObservable<S>>(source, []);

  const st = useObservable(() => source$.chain(setInitialValue(initialState)));

  const dispatch = useCallback(
    (action: A): S => {
      const nextState = reducer(st.getSnapshot().value, action);
      source$.next(nextState);
      return nextState;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [st, dispatch];
};
