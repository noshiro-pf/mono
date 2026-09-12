import { useState } from 'better-preact-use-state';

export const useExample = (
  initialFn: () => number,
  nextFn: () => number,
): Readonly<{ fn: () => number; onReplace: () => void }> => {
  // embed-sample-code-ignore-above
  const [{ fn }, setFn] = useState({ fn: initialFn });

  const onReplace = (): void => {
    setFn({ fn: nextFn });
  };
  // embed-sample-code-ignore-below

  return { fn, onReplace };
};
