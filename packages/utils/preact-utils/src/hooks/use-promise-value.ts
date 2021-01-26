import { PromiseState } from '@mono/ts-utils';
import { useEffect, useRef, useState } from 'preact/compat';

export const usePromiseValue = <T>(
  promise: Promise<T>
): PromiseState<undefined, any, T> => {
  const promiseMemoized = useRef(promise);

  const [settledValue, setSettledValue] = useState<
    PromiseState<undefined, any, T>
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
