import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useValueAsRef = <T>(value: T): MutableRefObject<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
