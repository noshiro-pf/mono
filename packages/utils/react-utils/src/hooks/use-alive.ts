import { useEffect, useState } from 'react';

export const useAlive = (): Readonly<{ current: boolean }> => {
  const [alive, setAlive] = useState<boolean>(true);

  useEffect(
    () => () => {
      setAlive(false);
    },
    []
  );

  return { current: alive };
};
