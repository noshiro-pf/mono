import { type Observable } from '@noshiro/syncflow';
import { useEffect } from 'preact/hooks';
import { useObservableState } from './use-observable-state';

export const useChangeValueEffect = <A>(
  input: A,
  callback: (v: A) => void
): void => {
  useEffect(() => {
    callback(input);
  }, [input, callback]);
};

export const useValueAsObservable = <A>(input: A): Observable<A> => {
  const { state$, setState } = useObservableState<A>(input);
  useChangeValueEffect(input, setState);
  return state$;
};
