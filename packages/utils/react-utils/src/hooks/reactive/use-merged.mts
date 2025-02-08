import { useState } from 'better-react-use-state';
import { useEffect } from 'react';

export function useMerged<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  init: T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9,
  value1: T1 | undefined,
  value2: T2 | undefined,
  value3?: T3,
  value4?: T4,
  value5?: T5,
  value6?: T6,
  value7?: T7,
  value8?: T8,
  value9?: T9,
): T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 {
  const [merged, set] = useState<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>(
    init,
  );

  useEffect(() => {
    if (value1 !== undefined) set(value1);
  }, [value1]);
  useEffect(() => {
    if (value2 !== undefined) set(value2);
  }, [value2]);
  useEffect(() => {
    if (value3 !== undefined) set(value3);
  }, [value3]);
  useEffect(() => {
    if (value4 !== undefined) set(value4);
  }, [value4]);
  useEffect(() => {
    if (value5 !== undefined) set(value5);
  }, [value5]);
  useEffect(() => {
    if (value6 !== undefined) set(value6);
  }, [value6]);
  useEffect(() => {
    if (value7 !== undefined) set(value7);
  }, [value7]);
  useEffect(() => {
    if (value8 !== undefined) set(value8);
  }, [value8]);
  useEffect(() => {
    if (value9 !== undefined) set(value9);
  }, [value9]);

  return merged;
}
