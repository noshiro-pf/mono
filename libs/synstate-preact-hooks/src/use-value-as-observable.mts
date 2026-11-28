import * as Preact from 'preact/hooks';
import {
  source,
  withInitialValue,
  type InitializedObservable,
  type Source,
} from 'synstate';
import { Optional } from 'ts-data-forge';

export const useValueAsObservable = <A,>(
  input: A,
): InitializedObservable<A> => {
  const sourceObservable = Preact.useMemo<Source<A>>(source, []);

  const state = Preact.useMemo(
    () => sourceObservable.pipe(withInitialValue(input)),
    [],
  );

  // A layout effect, whose cleanup runs as the component unmounts in preact 10
  // and 11; an effect's is deferred to after the next frame in 11.
  Preact.useLayoutEffect(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    () => () => {
      state.dispose();

      sourceObservable.dispose();
    },
    [],
  );

  Preact.useEffect(() => {
    // The observable already holds the value it was created with.
    if (!Object.is(Optional.unwrap(state.getSnapshot()), input)) {
      sourceObservable.emit(input);
    }
  }, [input]);

  return state;
};
