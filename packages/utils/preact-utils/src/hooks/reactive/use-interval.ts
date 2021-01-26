import { useEffect, useState } from 'preact/compat';

export const useInterval = (
  milliSec: number,
  delayMilliSec: number = 0
): number => {
  const [counter, setCounter] = useState<number>(0);
  useEffect(() => {
    let intervalTimer: any = undefined;
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
