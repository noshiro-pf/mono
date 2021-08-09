import { useEffect, useState } from 'preact/compat';

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
