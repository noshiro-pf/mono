import type { InitializedObservable } from '@noshiro/syncflow';
import { useCallback } from 'preact/compat';
import { useObservableReducer } from './use-observable-reducer';

type Action<S> = Readonly<
  { type: 'set'; nextState: S } | { type: 'update'; updateFn: (a: S) => S }
>;

const reducer = <S>(state: S, action: Action<S>): S => {
  switch (action.type) {
    case 'set':
      return action.nextState;
    case 'update':
      return action.updateFn(state);
  }
};

export const useObservableState = <S>(
  initialState: S
): [
  InitializedObservable<S>,
  (v: S) => void,
  (updateFn: (prev: S) => S) => void
] => {
  const [state$, dispatch] = useObservableReducer<S, Action<S>>(
    reducer,
    initialState
  );

  const updateState = useCallback((updateFn: (prev: S) => S): void => {
    dispatch({ type: 'update', updateFn });
  }, []);

  const setState = useCallback((nextState: S): void => {
    dispatch({ type: 'set', nextState });
  }, []);

  return [state$, setState, updateState];
};
