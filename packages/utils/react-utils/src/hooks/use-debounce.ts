import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebounce = <ResultValue>(
  fn: () => ResultValue,
  deps: any[],
  bufferMilliSec: number = 300
): ResultValue => {
  const timerId = useRef<any>(undefined);

  const [value, setValue] = useState<ResultValue>(fn);

  const clearTimer = useCallback(() => {
    clearTimeout(timerId.current);
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
