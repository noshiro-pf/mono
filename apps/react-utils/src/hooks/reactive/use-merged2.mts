import { useState } from 'better-react-use-state';
import * as React from 'react';

export const useMerged2 = <T1, T2>(
  init: T1 | T2,
  value1: T1,
  value2: T2,
): T1 | T2 => {
  const [merged, set] = useState(init);

  React.useEffect(() => {
    set(value1);
  }, [value1]);

  React.useEffect(() => {
    set(value2);
  }, [value2]);

  return merged;
};
