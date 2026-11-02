import { useState } from 'better-react-use-state';
import * as React from 'react';

export const useExample = (
  initialFn: () => number,
  nextFn: () => number,
): Readonly<{ fn: () => number; onReplace: () => void }> => {
  // embed-sample-code-ignore-above
  const [{ fn }, setFn] = useState({ fn: initialFn });

  const onReplace = React.useCallback((): void => {
    setFn({ fn: nextFn });
  }, [setFn, nextFn]);
  // embed-sample-code-ignore-below

  return { fn, onReplace };
};
