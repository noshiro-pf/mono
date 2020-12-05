import { PromiseResult } from '@mono/ts-utils';
import { useEffect, useRef, useState } from 'react';

export const usePromiseValue = <T>(
  promise: Promise<T>
): PromiseResult<undefined, any, T> => {
  const promiseMemoized = useRef(promise);

  const [settledValue, setSettledValue] = useState<
    PromiseResult<undefined, any, T>
  >({
    status: 'pending',
    value: undefined,
  });

  useEffect(() => {
    let alive = true;
    promiseMemoized.current
      .then((v) => {
        if (alive) {
          setSettledValue({ status: 'success', value: v });
        }
      })
      .catch((err) => {
        if (alive) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          setSettledValue({ status: 'error', value: err });
        }
      });
    return () => {
      alive = false;
    };
  }, [promiseMemoized]);

  return settledValue;
};
