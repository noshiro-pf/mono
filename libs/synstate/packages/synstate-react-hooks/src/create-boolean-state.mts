import {
  type InitializedObservable,
  createBooleanState as createBooleanStateBase,
} from 'synstate';
import { useObservableValue } from './use-observable-value.mjs';

export const createBooleanState = (
  initialState: boolean,
): readonly [
  useCurrentValue: () => boolean,
  utils: Readonly<{
    state: InitializedObservable<boolean>;
    setTrue: () => void;
    setFalse: () => void;
    setState: (next: boolean) => boolean;
    toggle: () => boolean;
    updateState: (updateFn: (prev: boolean) => boolean) => boolean;
    resetState: () => boolean;
    getSnapshot: () => boolean;
    initialState: boolean;
  }>,
] => {
  const [
    state,
    {
      setTrue,
      setFalse,
      setState,
      toggle,
      updateState,
      resetState,
      getSnapshot,
    },
  ] = createBooleanStateBase(initialState);

  const useCurrentValue = (): boolean => useObservableValue(state);

  return [
    useCurrentValue,
    {
      state,
      setTrue,
      setFalse,
      setState,
      toggle,
      updateState,
      resetState,
      getSnapshot,
      initialState,
    },
  ] as const;
};
