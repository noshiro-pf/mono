import { useCallback } from 'react';
import { useState } from './use-state.mjs';

export const useBoolState = (
  initialState: boolean,
): Readonly<{
  state: boolean;
  setTrue: () => void;
  setFalse: () => void;
  setState: (next: boolean) => void;
  resetState: () => void;
  toggleState: () => void;
  updateState: (updateFn: (v: boolean) => boolean) => void;
}> => {
  const { state, setState, resetState, updateState } =
    useState<boolean>(initialState);

  const setTrue = useCallback(() => {
    setState(true);
  }, [setState]);

  const setFalse = useCallback(() => {
    setState(false);
  }, [setState]);

  const toggleState = useCallback(() => {
    updateState((b) => !b);
  }, [updateState]);

  return {
    state,
    setState,
    updateState,
    setTrue,
    setFalse,
    toggleState,
    resetState,
  };
};
