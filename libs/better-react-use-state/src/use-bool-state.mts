import * as React from 'react';
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

  const setTrue = React.useCallback(() => {
    setState(true);
  }, [setState]);

  const setFalse = React.useCallback(() => {
    setState(false);
  }, [setState]);

  const toggleState = React.useCallback(() => {
    updateState((b) => !b);
  }, [updateState]);

  return [
    state,
    { setState, setTrue, setFalse, resetState, toggleState, updateState },
  ];
};
