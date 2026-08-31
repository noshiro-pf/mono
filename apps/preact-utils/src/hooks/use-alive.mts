import { useBoolState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';

export const useAlive = (): Readonly<{ current: boolean }> => {
  const [alive, { setFalse: kill }] = useBoolState(true);

  Preact.useEffect(() => kill, [kill]);

  return { current: alive };
};
