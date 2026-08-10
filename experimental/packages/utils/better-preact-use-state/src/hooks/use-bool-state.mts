import { useCallback } from 'preact/hooks';
import { useState } from './use-state.mjs';

export const useBoolState = (
  initialState: boolean,
): [
  state: boolean,
  Readonly<{
    setState: (next: boolean) => void;
    setTrue: () => void;
    setFalse: () => void;
    resetState: () => void;
    toggleState: () => void;
    updateState: (updateFn: (v: boolean) => boolean) => void;
  }>,
] => {
  const [state, setState, { resetState, updateState }] =
    useState<boolean>(initialState);

  const setTrue = useCallback(() => {
    setState(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleState = useCallback(() => {
    updateState((b) => !b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [
    state,
    {
      setState,
      updateState,
      setTrue,
      setFalse,
      toggleState,
      resetState,
    },
  ];
};
