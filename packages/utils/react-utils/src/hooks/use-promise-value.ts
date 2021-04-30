import { PromiseState } from '@noshiro/ts-utils';
import { useEffect, useRef, useState } from 'react';

export const usePromiseValue = <T>(
  promise: Readonly<Promise<T>>
): PromiseState<undefined, unknown, T> => {
  const promiseMemoized = useRef(promise);

  const [settledValue, setSettledValue] = useState<
    PromiseState<undefined, unknown, T>
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
      .catch((err: unknown) => {
        if (alive) {
          setSettledValue({ status: 'error', value: err });
        }
      });
    return () => {
      alive = false;
    };
  }, [promiseMemoized]);

  return settledValue;
};
