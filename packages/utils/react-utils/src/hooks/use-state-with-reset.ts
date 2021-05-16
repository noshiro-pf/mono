import { tuple } from '@noshiro/ts-utils';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';

export const useStateWithResetter = <T>(
  initialState: T
): [T, Dispatch<SetStateAction<T>>, () => void] => {
  const [state, setState] = useState<T>(initialState);
  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  return tuple(state, setState, resetState);
};
