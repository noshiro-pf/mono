import { useLayoutEffect, useReducer } from 'preact/hooks';
import type { InitializedObservable } from 'synstate';

/**
 * The current value of `observable`, re-rendering when it changes. Built on
 * `preact/hooks` alone: `useSyncExternalStore` is `preact/compat`'s, whose
 * import rewrites every element's props in the whole application. A router's
 * observables always hold a value, so the value is read during render, and the
 * subscription made after it renders checks that nothing changed in between.
 */
export const useObservableValue = <A,>(
  observable: InitializedObservable<A>,
): A => {
  const [, rerender] = useReducer(countRenders, 0);

  const value = observable.getSnapshot().value;

  useLayoutEffect(() => {
    const { unsubscribe } = observable.subscribe(() => {
      rerender(undefined);
    });

    // An emission between the render and this effect.
    if (!Object.is(observable.getSnapshot().value, value)) {
      rerender(undefined);
    }

    return unsubscribe;
  }, [observable, value]);

  return value;
};

const countRenders = (count: number, _action: undefined): number => count + 1;
