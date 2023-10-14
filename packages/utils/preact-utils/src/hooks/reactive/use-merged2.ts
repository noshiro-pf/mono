import { useEffect } from 'preact/hooks';
import { useState } from '../use-state';

export function useMerged2<T1, T2>(
  init: T1 | T2,
  value1: T1,
  value2: T2,
): T1 | T2 {
  const { state: merged, setState: set } = useState<T1 | T2>(init);
  useEffect(() => {
    set(value1);
  }, [value1, set]);
  useEffect(() => {
    set(value2);
  }, [value2, set]);
  return merged;
}
