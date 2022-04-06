import type { PromiseState } from '@noshiro/ts-utils-additional';
import { useEffect, useRef } from 'react';
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
    let mut_alive = true;
    promiseMemoized.current
      .then((v) => {
        if (mut_alive) {
          setSettledValue({ status: 'success', value: v });
        }
      })
      .catch((error: unknown) => {
        if (mut_alive) {
          setSettledValue({ status: 'error', value: error });
        }
      });
    return () => {
      mut_alive = false;
    };
  }, [promiseMemoized, setSettledValue]);

  return settledValue;
};
