import { type InitializedObservable } from '../core/index.mjs';
import { createReducer } from './create-reducer.mjs';

type Action<S> = Readonly<
  { type: 'set'; nextState: S } | { type: 'update'; updateFn: (a: S) => S }
>;

const reducer = <S,>(state: S, action: Action<S>): S => {
  switch (action.type) {
    case 'set':
      return action.nextState;
    case 'update':
      return action.updateFn(state);
  }
};

export const createState = <S,>(
  initialState: S,
): Readonly<{
  state: InitializedObservable<S>;
  setState: (v: S) => S;
  updateState: (updateFn: (prev: S) => S) => S;
  resetState: () => S;
  getSnapshot: () => S;
}> => {
  const { state, dispatch, getSnapshot } = createReducer<S, Action<S>>(
    reducer,
    initialState,
  );

  const updateState = (updateFn: (prev: S) => S): S =>
    dispatch({ type: 'update', updateFn });

  const setState = (nextState: S): S => dispatch({ type: 'set', nextState });

  const resetState = (): S =>
    dispatch({ type: 'set', nextState: initialState });

  return { state, setState, updateState, resetState, getSnapshot };
};

export const createBooleanState = (
  initialState: boolean,
): Readonly<{
  state: InitializedObservable<boolean>;
  setTrue: () => void;
  setFalse: () => void;
  setState: (next: boolean) => boolean;
  toggle: () => boolean;
  updateState: (updateFn: (prev: boolean) => boolean) => boolean;
  resetState: () => void;
  getSnapshot: () => boolean;
}> => {
  const { state, setState, updateState, resetState, getSnapshot } =
    createState(initialState);

  return {
    state,
    setTrue: () => {
      setState(true);
    },
    setFalse: () => {
      setState(false);
    },
    toggle: () => updateState((s) => !s),
    setState,
    updateState,
    resetState,
    getSnapshot,
  };
};
