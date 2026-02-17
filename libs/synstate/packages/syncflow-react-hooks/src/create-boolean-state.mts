import {
  type InitializedObservable,
  createBooleanState as createBooleanStateBase,
} from 'syncflow';
import { useObservableValue } from './use-observable-value.mjs';

export const createBooleanState = (
  initialState: boolean,
): readonly [
  useCurrentValue: () => boolean,
  Readonly<{
    state: InitializedObservable<boolean>;
    setTrue: () => void;
    setFalse: () => void;
    setState: (next: boolean) => boolean;
    toggle: () => boolean;
    updateState: (updateFn: (prev: boolean) => boolean) => boolean;
    resetState: () => boolean;
    getSnapshot: () => boolean;
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
    },
  ] as const;
};
