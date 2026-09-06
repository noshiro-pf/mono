import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';

export const useStateWithMapFn = <T, S>(
  init: T,
  mapFn: (v: S) => T,
): readonly [T, (value: S) => void] => {
  const [state, setState] = useState(init);

  const setter = Preact.useCallback(
    (value: S) => {
      setState(mapFn(value));
    },
    [mapFn],
  );

  return [state, setter];
};
