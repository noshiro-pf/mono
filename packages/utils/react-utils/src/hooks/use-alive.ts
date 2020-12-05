import { useEffect, useState } from 'react';

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
