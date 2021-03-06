import { useEffect, useState } from 'react';

export const useInterval = (
  milliSec: number,
  delayMilliSec: number = 0
): number => {
  const [counter, setCounter] = useState<number>(0);
  useEffect(() => {
    let intervalTimer: ReturnType<typeof setTimeout> | undefined = undefined;
    const delayTimer = setTimeout(() => {
      intervalTimer = setInterval(() => {
        setCounter((i) => i + 1);
      }, milliSec);
    }, delayMilliSec);

    return () => {
      if (intervalTimer !== undefined) {
        clearInterval(intervalTimer);
      }
      clearInterval(delayTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return counter;
};
