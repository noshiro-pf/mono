import type { PromiseState } from '@noshiro/ts-utils';
import { useEffect, useRef } from 'preact/hooks';
import { useState } from './use-state';

export const usePromiseValue = <T>(
  promise: Readonly<Promise<T>>
): PromiseState<undefined, unknown, T> => {
  const promiseMemoized = useRef(promise);

  const { state: settledValue, setState: setSettledValue } = useState<
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
  }, [promiseMemoized, setSettledValue]);

  return settledValue;
};
