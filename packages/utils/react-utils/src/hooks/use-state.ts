// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useState as _useState, useCallback } from 'react';

export const useState = <T>(
  initialState: T,
): Readonly<{
  state: T;
  setState: (next: T) => void;
  updateState: (updateFn: (v: T) => T) => void;
  resetState: () => void;
}> => {
  const [state, setState] = _useState<T>(initialState);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  const updateState = useCallback(
    (updateFn: (v: T) => T) => {
      setState(updateFn);
    },
    [setState],
  );

  return { state, setState, updateState, resetState };
};
