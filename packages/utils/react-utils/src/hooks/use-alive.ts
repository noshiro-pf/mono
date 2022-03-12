import { useEffect } from 'react';
import { useBoolState } from './use-bool-state';

export const useAlive = (): Readonly<{ current: boolean }> => {
  const { state: alive, setFalse: kill } = useBoolState(true);

  useEffect(() => kill, [kill]);

  return { current: alive };
};
