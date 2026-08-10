// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as React from 'react';
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

  const setTrue = React.useCallback(() => {
    setState(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFalse = React.useCallback(() => {
    setState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleState = React.useCallback(() => {
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
