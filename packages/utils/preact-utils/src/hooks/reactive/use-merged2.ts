import { useEffect, useState } from 'preact/compat';

export function useMerged2<T1, T2>(
  init: T1 | T2,
  value1: T1,
  value2: T2
): T1 | T2 {
  const [merged, set] = useState<T1 | T2>(init);
  useEffect(() => set(value1), [value1]);
  useEffect(() => set(value2), [value2]);
  return merged;
}
