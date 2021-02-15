import { TinyObservable } from '@noshiro/ts-utils';
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

// Wraps the value with an object to avoid setState's update behavior when T is function type.
export function useTinyObservableValue<T>(
  stream$: TinyObservable<T>,
  initialValue: T
): T;
export function useTinyObservableValue<T>(
  stream$: TinyObservable<T>
): T | undefined;
export function useTinyObservableValue<T>(
  stream$: TinyObservable<T>,
  initialValue?: T
): T | undefined {
  const [state, setState] = useState<{ value: T | undefined }>({
    value: initialValue,
  });
  useTinyObservableEffect(stream$, (value) => {
    setState({ value });
  });
  return state.value ?? initialValue;
}
