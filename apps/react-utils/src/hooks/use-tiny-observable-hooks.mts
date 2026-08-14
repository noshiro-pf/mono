import { useState } from 'better-react-use-state';
import * as React from 'react';
import {
  createTinyObservable,
  type TinyObservable,
  type TinyObservableSource,
} from '../utils/index.mjs';

export const useTinyObservable = <T,>(): TinyObservableSource<T> => {
  const ref = React.useRef(createTinyObservable<T>());

  return ref.current;
};

export const useTinyObservableEffect = <T,>(
  observable$: TinyObservable<T>,
  subscriptionFn: (v: T) => void,
): void => {
  const ref = React.useRef({ observable$, subscriptionFn });

  React.useEffect(() => {
    const s = ref.current.observable$.subscribe(ref.current.subscriptionFn);

    return () => {
      s.unsubscribe();
    };
  }, []);
};

// Wraps the value with an object to avoid setState's update behavior when T is function type.
export function useTinyObservableValue<T>(
  observable$: TinyObservable<T>,
  initialValue: T,
): T;

export function useTinyObservableValue<T>(
  observable$: TinyObservable<T>,
): T | undefined;

export function useTinyObservableValue<T>(
  observable$: TinyObservable<T>,
  initialValue?: T,
): T | undefined {
  const [state, setState] = useState({
    value: initialValue,
  });

  useTinyObservableEffect(observable$, (value) => {
    setState({ value });
  });

  return state.value ?? initialValue;
}
