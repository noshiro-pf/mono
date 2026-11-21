import { useLayoutEffect, useReducer } from 'preact/hooks';
import type { InitializedObservable } from 'synstate';
import { Optional } from 'ts-data-forge';

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

  const value = Optional.unwrap(observable.getSnapshot());

  useLayoutEffect(() => {
    // `subscribe` calls back at once with the value just rendered, which needs
    // no render.
    let mut_subscribed = false;

    const unsubscribe = observable.subscribe(() => {
      if (mut_subscribed) {
        rerender(undefined);
      }
    });

    mut_subscribed = true;

    // An emission between the render and this effect.
    if (!Object.is(Optional.unwrap(observable.getSnapshot()), value)) {
      rerender(undefined);
    }

    return unsubscribe;
  }, [observable, value]);

  return value;
};

const countRenders = (count: number, _action: undefined): number => count + 1;
