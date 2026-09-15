import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';

export const useInterval = (
  milliSec: number,
  delayMilliSec: number = 0,
): number => {
  const [counter, _, { updateState: updateCounter }] = useState(0);

  Preact.useEffect(() => {
    let mut_intervalTimer: ReturnType<typeof setTimeout> | undefined =
      undefined;

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
  }, []);

  return counter;
};
