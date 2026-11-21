import * as React from 'react';
import {
  source,
  withInitialValue,
  type InitializedObservable,
  type Source,
} from 'synstate';
import { Optional } from 'ts-data-forge';

/**
 * Returns an observable that holds `input` and emits each new `input` the
 * component renders with. It is disposed when the component unmounts, in a
 * timer of 0 ms.
 *
 * React 18 and later run an effect's cleanup without unmounting in two cases.
 * StrictMode runs it once after mount in development and sets the effect up
 * again at once; disposing only in a timer after the cleanup lets that setup
 * keep the same observable. `<Activity mode="hidden">` (React 19.2) runs it and
 * keeps the component's state; the observable is disposed, and is replaced with a
 * new one holding the latest value when the component renders or is shown
 * again. So read the observable from each render rather than keeping the first
 * one.
 */
export const useValueAsObservable = <A,>(
  input: A,
): InitializedObservable<A> => {
  const [observables, setObservables] = React.useState(() =>
    createObservables(input),
  );

  /** Bumped by every setup, so that a disposal scheduled before it lapses. */
  const mut_setups = React.useRef(0);

  // Replaced during render, so that what renders below gets the new one at once.
  if (observables.state.settled) {
    setObservables(createObservables(input));
  }

  // A new `input` runs this effect's cleanup and setup again at once, and the
  // setup cancels the disposal the cleanup scheduled.
  React.useEffect(() => {
    mut_setups.current += 1;

    if (observables.state.settled) {
      // Shown again with no render: start from the latest input React
      // committed, which a render while hidden may have changed after the
      // disposed observable stopped taking values.
      setObservables(createObservables(input));

      return undefined;
    }

    return () => {
      const setups = mut_setups.current;

      setTimeout(() => {
        if (mut_setups.current !== setups) {
          return;
        }

        observables.state.dispose();

        observables.source.dispose();
      }, 0);
    };
  }, [observables, input]);

  React.useEffect(() => {
    // The observable already holds the value it was created with.
    if (
      !observables.state.settled &&
      !Object.is(Optional.unwrap(observables.state.getSnapshot()), input)
    ) {
      observables.source.emit(input);
    }
  }, [input, observables]);

  return observables.state;
};

type Observables<A> = Readonly<{
  source: Source<A>;
  state: InitializedObservable<A>;
}>;

const createObservables = <A,>(input: A): Observables<A> => {
  const source$ = source<A>();

  return { source: source$, state: source$.pipe(withInitialValue(input)) };
};
