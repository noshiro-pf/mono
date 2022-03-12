import type { Observable } from '@noshiro/syncflow';
import { useEffect } from 'react';
import { useObservableState } from './use-state-as-stream';

export const useChangeValueEffect = <A>(
  input: A,
  callback: (v: A) => void
): void => {
  useEffect(() => {
    callback(input);
  }, [input, callback]);
};

export const useValueAsObservable = <A>(input: A): Observable<A> => {
  const [value$, setValue] = useObservableState<A>(input);
  useChangeValueEffect(input, setValue);
  return value$;
};
