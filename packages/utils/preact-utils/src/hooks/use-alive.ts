import { useEffect, useState } from 'preact/compat';

export const useAlive = (): boolean => {
  const [alive, setAlive] = useState<boolean>(true);

  useEffect(
    () => () => {
      setAlive(false);
    },
    []
  );

  return alive;
};
