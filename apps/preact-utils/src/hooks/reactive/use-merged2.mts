import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';

export const useMerged2 = <T1, T2>(
  init: T1 | T2,
  value1: T1,
  value2: T2,
): T1 | T2 => {
  // The type argument is unavoidable — there is nothing to infer it from —
  // and the React Compiler rule reads a hook call that carries one as a
  // reference to the hook rather than a call to it.
  // eslint-disable-next-line react-hooks/hooks
  const [merged, set] = useState<T1 | T2>(init);

  Preact.useEffect(() => {
    set(value1);
  }, [value1]);

  Preact.useEffect(() => {
    set(value2);
  }, [value2]);

  return merged;
};
