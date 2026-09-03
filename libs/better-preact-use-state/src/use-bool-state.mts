import * as Preact from 'preact/hooks';
import { useState } from './use-state.mjs';

export const useBoolState = (
  initialState: boolean,
): readonly [
  state: boolean,
  setters: Readonly<{
    setState: (next: boolean) => void;
    setTrue: () => void;
    setFalse: () => void;
    resetState: () => void;
    toggleState: () => void;
    updateState: (updateFn: (v: boolean) => boolean) => void;
  }>,
] => {
  // No explicit type argument: `initialState` gives it, and the React Compiler
  // rule reads `useState<boolean>(…)` on a custom hook as a reference to the
  // hook rather than a call to it.
  const [state, setState, { resetState, updateState }] = useState(initialState);

  const setTrue = Preact.useCallback(() => {
    setState(true);
  }, [setState]);

  const setFalse = Preact.useCallback(() => {
    setState(false);
  }, [setState]);

  const toggleState = Preact.useCallback(() => {
    updateState((b) => !b);
  }, [updateState]);

  return [
    state,
    { setState, setTrue, setFalse, resetState, toggleState, updateState },
  ];
};
