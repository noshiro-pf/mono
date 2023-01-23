import { useEffect, useRef, type Ref } from 'preact/hooks';

export const useValueAsRef = <T>(value: T): Ref<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
