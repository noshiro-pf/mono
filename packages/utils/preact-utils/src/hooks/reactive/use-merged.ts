import { useEffect, useState } from 'preact/compat';

const noop = (): undefined => undefined;

export function useMerged<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  init: T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9,
  value1: T1 | undefined,
  value2: T2 | undefined,
  value3?: T3 | undefined,
  value4?: T4 | undefined,
  value5?: T5 | undefined,
  value6?: T6 | undefined,
  value7?: T7 | undefined,
  value8?: T8 | undefined,
  value9?: T9 | undefined
): T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 {
  const [merged, set] = useState<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>(
    init
  );
  useEffect(() => (value1 !== undefined ? set(value1) : noop()), [value1]);
  useEffect(() => (value2 !== undefined ? set(value2) : noop()), [value2]);
  useEffect(() => (value3 !== undefined ? set(value3) : noop()), [value3]);
  useEffect(() => (value4 !== undefined ? set(value4) : noop()), [value4]);
  useEffect(() => (value5 !== undefined ? set(value5) : noop()), [value5]);
  useEffect(() => (value6 !== undefined ? set(value6) : noop()), [value6]);
  useEffect(() => (value7 !== undefined ? set(value7) : noop()), [value7]);
  useEffect(() => (value8 !== undefined ? set(value8) : noop()), [value8]);
  useEffect(() => (value9 !== undefined ? set(value9) : noop()), [value9]);
  return merged;
}
