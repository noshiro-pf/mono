import { useCallback, useState } from 'react';

export const useToggleState = (init: boolean): [boolean, () => void] => {
  const [state, setState] = useState<boolean>(init);

  const toggle = useCallback(() => {
    setState((b) => !b);
  }, []);

  return [state, toggle];
};
