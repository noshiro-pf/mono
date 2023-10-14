import { useCallback } from 'react';
import { useState } from './use-state';

export const useStateWithMapFn = <T, S>(
  init: T,
  mapFn: (v: S) => T,
): [T, (value: S) => void] => {
  const { state, setState } = useState<T>(init);
  const setter = useCallback(
    (value: S) => {
      setState(mapFn(value));
    },
    [mapFn, setState],
  );
  return [state, setter];
};
