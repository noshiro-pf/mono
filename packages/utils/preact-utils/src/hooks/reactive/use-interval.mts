import { useState } from 'better-preact-use-state';
import { useEffect } from 'preact/hooks';

export const useInterval = (
  milliSec: number,
  delayMilliSec: number = 0,
): number => {
  const [counter, _, { updateState: updateCounter }] = useState<number>(0);

  useEffect(() => {
    let mut_intervalTimer: TimerId | undefined = undefined;
    const delayTimer = setTimeout(() => {
      mut_intervalTimer = setInterval(() => {
        updateCounter((i) => i + 1);
      }, milliSec);
    }, delayMilliSec);

    return () => {
      if (mut_intervalTimer !== undefined) {
        clearInterval(mut_intervalTimer);
      }
      clearInterval(delayTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return counter;
};
