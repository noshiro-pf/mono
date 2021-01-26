import { Ref, useEffect, useRef } from 'preact/compat';

export const useValueAsRef = <T>(value: T): Ref<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
