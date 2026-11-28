import type { InitializedObservable, StateOptions } from '../core/index.mjs';
import { createState } from './create-state.mjs';

/** A boolean state with `setTrue`, `setFalse` and `toggle`. */
export const createBooleanState = (
  initialState: boolean,
  options?: StateOptions<boolean>,
): readonly [
  state: InitializedObservable<boolean>,
  utils: Readonly<{
    setTrue: () => void;
    setFalse: () => void;
    toggle: () => void;
    setState: (next: boolean) => void;
    updateState: (updateFn: (current: boolean) => boolean) => void;
    resetState: () => void;
    getSnapshot: () => boolean;
    initialState: boolean;
  }>,
] => {
  const [node, setState, { updateState, resetState, getSnapshot }] =
    createState(initialState, options);

  return [
    node,
    {
      setTrue: () => {
        setState(true);
      },
      setFalse: () => {
        setState(false);
      },
      toggle: () => {
        updateState(negate);
      },
      setState,
      updateState,
      resetState,
      getSnapshot,
      initialState,
    },
  ] as const;
};

const negate = (b: boolean): boolean => !b;
