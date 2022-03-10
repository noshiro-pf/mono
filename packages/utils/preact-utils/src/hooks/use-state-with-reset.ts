import { tuple } from '@noshiro/ts-utils';
import type { StateUpdater } from 'preact/compat';
import { useCallback, useState } from 'preact/compat';

/** @deprecated */
export const useStateWithResetter = <T>(
  initialState: T
): [T, StateUpdater<T>, () => void] => {
  const [state, setState] = useState<T>(initialState);
  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  return tuple(state, setState, resetState);
};
