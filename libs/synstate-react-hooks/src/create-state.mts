import {
  createState as createStateBase,
  type InitializedObservable,
  type StateOptions,
} from 'synstate';
import { useObservableValue } from './use-observable-value.mjs';

export const createState = <S,>(
  initialState: S,
  options?: StateOptions<NoInfer<S>>,
): readonly [
  useCurrentValue: () => S,
  setState: (v: S) => void,
  utils: Readonly<{
    state: InitializedObservable<S>;
    updateState: (updateFn: (prev: S) => S) => void;
    resetState: () => void;
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const [state, setState, { updateState, resetState, getSnapshot }] =
    createStateBase(initialState, options);

  const useCurrentValue = (): S => useObservableValue(state);

  return [
    useCurrentValue,
    setState,
    {
      state,
      updateState,
      resetState,
      getSnapshot,
      initialState,
    },
  ] as const;
};
