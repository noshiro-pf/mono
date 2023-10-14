import { type InitializedObservable } from '@noshiro/syncflow';
import { useCallback } from 'preact/hooks';
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
  initialState: S,
): Readonly<{
  state$: InitializedObservable<S>;
  setState: (v: S) => S;
  updateState: (updateFn: (prev: S) => S) => S;
  resetState: () => S;
}> => {
  const [state$, dispatch] = useObservableReducer<S, Action<S>>(
    reducer,
    initialState,
  );

  const updateState = useCallback(
    (updateFn: (prev: S) => S): S => dispatch({ type: 'update', updateFn }),
    [],
  );

  const setState = useCallback(
    (nextState: S): S => dispatch({ type: 'set', nextState }),
    [],
  );

  const resetState = useCallback(
    (): S => dispatch({ type: 'set', nextState: initialState }),
    [],
  );

  return { state$, setState, updateState, resetState };
};
