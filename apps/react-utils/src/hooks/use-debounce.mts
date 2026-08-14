import { useState } from 'better-react-use-state';
import * as React from 'react';

/** What `setTimeout` returns and `clearTimeout` takes; a global in the old
 * `@noshiro/ts-type-utils`, and right under both Node and the browser here. */
type TimerId = Parameters<typeof clearTimeout>[0];

export const useDebounce = <ResultValue,>(
  fn: () => ResultValue,
  deps: readonly unknown[],
  bufferMilliSec: number = 300,
): ResultValue => {
  const timerId = React.useRef<TimerId | undefined>(undefined);

  const [value, setValue] = useState(fn());

  const clearTimer = React.useCallback(() => {
    if (timerId.current !== undefined) {
      clearTimeout(timerId.current);
    }
  }, []);

  React.useEffect(
    () => {
      clearTimer();

      timerId.current = setTimeout(() => {
        setValue(fn());
      }, bufferMilliSec);

      return clearTimer;
    },
    deps, // eslint-disable-line react-hooks/exhaustive-deps
  );

  return value;
};
