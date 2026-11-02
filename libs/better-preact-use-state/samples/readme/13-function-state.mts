import { useState } from 'better-preact-use-state';
import { useCallback } from 'preact/hooks';

export const useExample = (
  initialFn: () => number,
  nextFn: () => number,
): Readonly<{ fn: () => number; onReplace: () => void }> => {
  // embed-sample-code-ignore-above
  const [{ fn }, setFn] = useState({ fn: initialFn });

  const onReplace = useCallback((): void => {
    setFn({ fn: nextFn });
  }, [setFn, nextFn]);
  // embed-sample-code-ignore-below

  return { fn, onReplace };
};
