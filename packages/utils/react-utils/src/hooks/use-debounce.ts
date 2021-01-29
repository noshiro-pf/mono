import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebounce = <ResultValue>(
  fn: () => ResultValue,
  deps: readonly unknown[],
  bufferMilliSec: number = 300
): ResultValue => {
  const timerId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [value, setValue] = useState<ResultValue>(fn);

  const clearTimer = useCallback(() => {
    if (timerId.current !== undefined) {
      clearTimeout(timerId.current);
    }
  }, []);

  useEffect(
    () => {
      clearTimer();
      timerId.current = setTimeout(() => {
        setValue(fn());
      }, bufferMilliSec);
      return clearTimer;
    },
    deps // eslint-disable-line react-hooks/exhaustive-deps
  );

  return value;
};
