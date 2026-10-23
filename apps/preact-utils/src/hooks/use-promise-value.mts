import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';
import { AsyncData } from 'ts-std-forge';

export const usePromiseValue = <T,>(
  promise: Readonly<Promise<T>>,
): AsyncData<T, unknown> => {
  const promiseMemoized = Preact.useRef(promise);

  const [settledValue, setSettledValue] = useState<AsyncData<T, unknown>>(
    AsyncData.pending(),
  );

  Preact.useEffect(() => {
    let mut_alive = true;

    promiseMemoized.current
      .then((v) => {
        if (mut_alive) {
          setSettledValue(AsyncData.ok(v));
        }
      })
      .catch((error: unknown) => {
        if (mut_alive) {
          setSettledValue(AsyncData.err(error));
        }
      });

    return () => {
      mut_alive = false;
    };
  }, [promiseMemoized]);

  return settledValue;
};
