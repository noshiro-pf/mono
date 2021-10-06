import type { InitializedObservable } from '../core';
import { createReducer } from './create-reducer';

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

export const createState = <S>(
  initialState: S
): [
  InitializedObservable<S>,
  (v: S) => void,
  (updateFn: (prev: S) => S) => void
] => {
  const [state$, dispatch] = createReducer<S, Action<S>>(reducer, initialState);

  const updateState = (updateFn: (prev: S) => S): void => {
    dispatch({ type: 'update', updateFn });
  };

  const setState = (nextState: S): void => {
    dispatch({ type: 'set', nextState });
  };

  return [state$, setState, updateState];
};
