import * as Preact from 'preact/hooks';

export const useValueAsRef = <T,>(value: T): preact.Ref<T> => {
  const ref = Preact.useRef(value);

  Preact.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
