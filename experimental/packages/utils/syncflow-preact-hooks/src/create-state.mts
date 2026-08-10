import {
  createBooleanState as createBooleanStateImpl,
  createState as createStateImpl,
  type InitializedObservable,
} from '@noshiro/syncflow';
import { useObservableValue } from './use-observable.mjs';

export const createState = <S,>(
  initialState: S,
): Readonly<{
  state: InitializedObservable<S>;
  setState: (v: S) => S;
  updateState: (updateFn: (prev: S) => S) => S;
  resetState: () => S;
  useCurrentValue: () => S;
  getSnapshot: () => S;
}> => {
  const { state, setState, updateState, resetState, getSnapshot } =
    createStateImpl(initialState);

  const useCurrentValue = (): S => useObservableValue(state);

  return {
    state,
    setState,
    updateState,
    resetState,
    useCurrentValue,
    getSnapshot,
  };
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
  useCurrentValue: () => boolean;
  getSnapshot: () => boolean;
}> => {
  const {
    state,
    setState,
    updateState,
    resetState,
    setFalse,
    setTrue,
    toggle,
    getSnapshot,
  } = createBooleanStateImpl(initialState);

  const useCurrentValue = (): boolean => useObservableValue(state);

  return {
    state,
    setState,
    updateState,
    resetState,
    setFalse,
    setTrue,
    toggle,
    useCurrentValue,
    getSnapshot,
  };
};
