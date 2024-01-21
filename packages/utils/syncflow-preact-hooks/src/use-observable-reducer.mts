import {
  source,
  withInitialValue,
  type InitializedObservable,
  type SourceObservable,
} from '@noshiro/syncflow';
import { useCallback, useMemo } from 'preact/hooks';
import { useObservable } from './use-observable.mjs';

/** `reducer` 及び `initialState` は初期値でのみ評価される。 動的に変更しても state には反映されないので注意。 */
export const useObservableReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): readonly [InitializedObservable<S>, (action: A) => S] => {
  const source$ = useMemo<SourceObservable<S>>(source, []);

  const state$ = useObservable(() =>
    source$.chain(withInitialValue(initialState)),
  );

  const dispatch = useCallback(
    (action: A): S => {
      const nextState = reducer(state$.snapshot.value, action);
      source$.next(nextState);
      return nextState;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [state$, dispatch];
};
