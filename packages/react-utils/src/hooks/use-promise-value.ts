import { useEffect, useState } from 'react';

export const usePromiseValue = <T>(promise: Promise<T>): T | undefined => {
  const [settledValue, setSettledValue] = useState<T | undefined>();

  useEffect(() => {
    let alive = true;
    promise
      .then((v) => {
        if (alive) setSettledValue(v);
      })
      .catch((err) => {
        if (alive) console.error(err);
      });
    return () => {
      alive = false;
    };
  }, [promise]);

  return settledValue;
};
