import { TinyObservable } from '@mono/ts-utils';
import { useEffect, useRef, useState } from 'preact/compat';

export const useTinyObservable = <T>(): TinyObservable<T> => {
  const ref = useRef(new TinyObservable<T>());
  return ref.current;
};

export const useTinyObservableEffect = <T>(
  stream$: TinyObservable<T>,
  subscriptionFn: (v: T) => void
): void => {
  const ref = useRef({ stream$, subscriptionFn });
  useEffect(() => {
    const s = ref.current.stream$.subscribe(ref.current.subscriptionFn);
    return () => {
      s.unsubscribe();
    };
  }, []);
};

interface UseTinyObservableValueType {
  <T>(stream$: TinyObservable<T>): T | undefined;
  <T>(stream$: TinyObservable<T>, initialValue: T): T;
}

// Wraps the value with an object to avoid setState's update behavior when T is function type.
export const useTinyObservableValue: UseTinyObservableValueType = <T>(
  stream$: TinyObservable<T>,
  initialValue?: T
) => {
  const [state, setState] = useState<{ value: T | undefined }>({
    value: initialValue,
  });
  useTinyObservableEffect(stream$, (value) => {
    setState({ value });
  });
  return state.value ?? initialValue;
};
