import * as Preact from 'preact/hooks';
import {
  source,
  withInitialValue,
  type Observable,
  type SourceObservable,
} from 'synstate';
import { Optional } from 'ts-data-forge';

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

  Preact.useEffect(() => {
    // The observable already holds the value it was created with.
    if (!Object.is(Optional.unwrap(state.getSnapshot()), input)) {
      sourceObservable.next(input);
    }
  }, [input]);

  return state;
};
