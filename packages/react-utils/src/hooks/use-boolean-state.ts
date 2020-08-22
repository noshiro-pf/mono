import { useCallback, useState } from 'react';

export const useBooleanState = (
  init: boolean
): [boolean, () => void, () => void] => {
  const [state, setState] = useState<boolean>(init);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return [state, setTrue, setFalse];
};
