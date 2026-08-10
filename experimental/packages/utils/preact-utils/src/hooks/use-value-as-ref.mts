import { useEffect, useRef } from 'preact/hooks';

export const useValueAsRef = <T,>(value: T): preact.Ref<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
