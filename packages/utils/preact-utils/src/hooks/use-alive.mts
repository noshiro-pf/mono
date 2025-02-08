import { useBoolState } from 'better-preact-use-state';
import { useEffect } from 'preact/hooks';

export const useAlive = (): Readonly<{ current: boolean }> => {
  const [alive, { setFalse: kill }] = useBoolState(true);

  useEffect(() => kill, [kill]);

  return { current: alive };
};
