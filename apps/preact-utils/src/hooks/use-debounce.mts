import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';

export const useDebounce = <ResultValue,>(
  fn: () => ResultValue,
  deps: readonly unknown[],
  bufferMilliSec: number = 300,
): ResultValue => {
  const timerId = Preact.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const [value, setValue] = useState<ResultValue>(fn());

  const clearTimer = Preact.useCallback(() => {
    if (timerId.current !== undefined) {
      clearTimeout(timerId.current);
    }
  }, []);

  Preact.useEffect(() => {
    clearTimer();

    timerId.current = setTimeout(() => {
      setValue(fn());
    }, bufferMilliSec);

    return clearTimer;
  }, deps);

  return value;
};
