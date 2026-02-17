import * as Preact from 'preact/hooks';
import {
  source,
  withInitialValue,
  type Observable,
  type SourceObservable,
} from 'syncflow';

export const useValueAsObservable = <A,>(input: A): Observable<A> => {
  const sourceObservable = Preact.useMemo<SourceObservable<A>>(source, []);

  const state = Preact.useMemo(
    () => sourceObservable.pipe(withInitialValue(input)),
    [],
  );

  Preact.useEffect(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    () => () => {
      state.complete();
    },
    [],
  );

  const setState = Preact.useCallback((nextState: A): A => {
    sourceObservable.next(nextState);

    return nextState;
  }, []);

  Preact.useEffect(() => {
    setState(input);
  }, [input]);

  return state;
};
