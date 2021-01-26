import { tuple } from '@mono/ts-utils';
import { StateUpdater, useCallback, useState } from 'preact/compat';

export const useStateWithResetter = <T>(
  initialState: T
): [T, StateUpdater<T>, () => void] => {
  const [state, setState] = useState<T>(initialState);
  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  return tuple(state, setState, resetState);
};
