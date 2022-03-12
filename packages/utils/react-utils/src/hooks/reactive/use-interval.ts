import { useEffect } from 'react';
import { useState } from '../use-state';

export const useInterval = (
  milliSec: number,
  delayMilliSec: number = 0
): number => {
  const { state: counter, updateState: updateCounter } = useState<number>(0);
  useEffect(() => {
    let intervalTimer: TimerId | undefined = undefined;
    const delayTimer = setTimeout(() => {
      intervalTimer = setInterval(() => {
        updateCounter((i) => i + 1);
      }, milliSec);
    }, delayMilliSec);

    return () => {
      if (intervalTimer !== undefined) {
        clearInterval(intervalTimer);
      }
      clearInterval(delayTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return counter;
};
