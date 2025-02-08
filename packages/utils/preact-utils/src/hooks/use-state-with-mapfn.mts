import { useState } from 'better-preact-use-state';
import { useCallback } from 'preact/hooks';

export const useStateWithMapFn = <T, S>(
  init: T,
  mapFn: (v: S) => T,
): [T, (value: S) => void] => {
  const [state, setState] = useState<T>(init);

  const setter = useCallback(
    (value: S) => {
      setState(mapFn(value));
    },
    [mapFn],
  );
  return [state, setter];
};
