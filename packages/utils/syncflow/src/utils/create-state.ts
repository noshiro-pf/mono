import { type InitializedObservable } from '../core';
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
  initialState: S,
): Readonly<{
  state$: InitializedObservable<S>;
  setState: (v: S) => S;
  updateState: (updateFn: (prev: S) => S) => S;
  resetState: () => S;
}> => {
  const [state$, dispatch] = createReducer<S, Action<S>>(reducer, initialState);

  const updateState = (updateFn: (prev: S) => S): S =>
    dispatch({ type: 'update', updateFn });

  const setState = (nextState: S): S => dispatch({ type: 'set', nextState });

  const resetState = (): S =>
    dispatch({ type: 'set', nextState: initialState });

  return { state$, setState, updateState, resetState };
};

export const createBooleanState = (
  initialState: boolean,
): {
  state$: InitializedObservable<boolean>;
  setTrue: () => void;
  setFalse: () => void;
  setState: (next: boolean) => boolean;
  toggle: () => boolean;
  updateState: (updateFn: (prev: boolean) => boolean) => boolean;
  reset: () => void;
} => {
  const { state$, setState, updateState, resetState } =
    createState(initialState);

  return {
    state$,
    setTrue: () => {
      setState(true);
    },
    setFalse: () => {
      setState(false);
    },
    toggle: () => updateState((s) => !s),
    setState,
    updateState,
    reset: resetState,
  };
};
