import { useState } from 'better-preact-use-state';
import { useCallback, useEffect, useRef } from 'preact/hooks';

export const useDebounce = <ResultValue,>(
  fn: () => ResultValue,
  deps: readonly unknown[],
  bufferMilliSec: number = 300,
): ResultValue => {
  const timerId = useRef<TimerId | undefined>(undefined);

  const [value, setValue] = useState<ResultValue>(fn());

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
    deps, // eslint-disable-line react-hooks/exhaustive-deps
  );

  return value;
};
