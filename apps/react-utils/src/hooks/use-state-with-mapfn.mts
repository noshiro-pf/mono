import { useState } from 'better-react-use-state';
import * as React from 'react';

export const useStateWithMapFn = <T, S>(
  init: T,
  mapFn: (v: S) => T,
): readonly [T, (value: S) => void] => {
  const [state, setState] = useState(init);

  const setter = React.useCallback(
    (value: S) => {
      setState(mapFn(value));
    },
    [mapFn, setState],
  );

  return [state, setter];
};
