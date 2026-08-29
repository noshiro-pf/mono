import { useState } from 'better-react-use-state';
import * as React from 'react';

/** What `setTimeout` returns and `clearTimeout` takes; a global in the old
 * `@noshiro/ts-type-utils`, and right under both Node and the browser here. */
type TimerId = Parameters<typeof clearTimeout>[0];

export const useInterval = (
  milliSec: number,
  delayMilliSec: number = 0,
): number => {
  const [counter, _, { updateState: updateCounter }] = useState(0);

  React.useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return counter;
};
