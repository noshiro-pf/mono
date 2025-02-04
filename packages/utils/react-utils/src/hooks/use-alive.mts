import { useBoolState } from 'better-react-use-state';
import { useEffect } from 'react';

export const useAlive = (): Readonly<{ current: boolean }> => {
  const [alive, { setFalse: kill }] = useBoolState(true);

  useEffect(() => kill, [kill]);

  return { current: alive };
};
