import { useBoolState } from 'better-react-use-state';
import * as React from 'react';

export const useAlive = (): Readonly<{ current: boolean }> => {
  const [alive, { setFalse: kill }] = useBoolState(true);

  React.useEffect(() => kill, [kill]);

  return { current: alive };
};
