import {
  createState as createStateBase,
  type InitializedObservable,
} from 'syncflow';
import { useObservableValue } from './use-observable-value.mjs';

export const createState = <S,>(
  initialState: S,
): readonly [
  useCurrentValue: () => S,
  setState: (v: S) => S,
  Readonly<{
    state: InitializedObservable<S>;
    updateState: (updateFn: (prev: S) => S) => S;
    resetState: () => S;
    getSnapshot: () => S;
  }>,
] => {
  const [state, setState, { updateState, resetState, getSnapshot }] =
    createStateBase(initialState);

  const useCurrentValue = (): S => useObservableValue(state);

  return [
    useCurrentValue,
    setState,
    {
      state,
      updateState,
      resetState,
      getSnapshot,
    },
  ] as const;
};
