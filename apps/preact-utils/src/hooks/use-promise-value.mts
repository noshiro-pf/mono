import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';
import { type PromiseState } from '../utils/index.mjs';

export const usePromiseValue = <T,>(
  promise: Readonly<Promise<T>>,
): PromiseState<undefined, unknown, T> => {
  const promiseMemoized = Preact.useRef(promise);

  const [settledValue, setSettledValue] = useState<
    PromiseState<undefined, unknown, T>
  >({
    status: 'pending',
    value: undefined,
  });

  Preact.useEffect(() => {
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
  }, [promiseMemoized]);

  return settledValue;
};
