import { useState } from 'better-react-use-state';
import * as React from 'react';

export const useDebounce = <ResultValue,>(
  fn: () => ResultValue,
  deps: readonly unknown[],
  bufferMilliSec: number = 300,
): ResultValue => {
  const timerId = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

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
