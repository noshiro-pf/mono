import * as Preact from 'preact/hooks';
import {
  source,
  withInitialValue,
  type Observable,
  type SourceObservable,
} from 'synstate';

export const useValueAsObservable = <A,>(input: A): Observable<A> => {
  const sourceObservable = Preact.useMemo<SourceObservable<A>>(source, []);

  const state = Preact.useMemo(
    () => sourceObservable.pipe(withInitialValue(input)),
    [],
  );

  // A layout effect, whose cleanup runs as the component unmounts in preact 10
  // and 11; an effect's is deferred to after the next frame in 11.
  Preact.useLayoutEffect(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    () => () => {
      state.complete();
    },
    [],
  );

  Preact.useEffect(() => {
    // The observable already holds the value it was created with.
    if (!Object.is(state.getSnapshot().value, input)) {
      sourceObservable.next(input);
    }
  }, [input]);

  return state;
};
