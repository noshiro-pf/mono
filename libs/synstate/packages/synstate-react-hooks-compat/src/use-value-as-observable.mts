import * as React from 'react';
import {
  source,
  withInitialValue,
  type Observable,
  type SourceObservable,
} from 'synstate';

export const useValueAsObservable = <A,>(input: A): Observable<A> => {
  const sourceObservable = React.useMemo<SourceObservable<A>>(source, []);

  const state = React.useMemo(
    () => sourceObservable.pipe(withInitialValue(input)),
    [],
  );

  React.useEffect(
    () => () => {
      state.complete();
    },
    [],
  );

  const setState = React.useCallback((nextState: A): A => {
    sourceObservable.next(nextState);

    return nextState;
  }, []);

  React.useEffect(() => {
    setState(input);
  }, [input]);

  return state;
};
