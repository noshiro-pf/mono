import * as React from 'react';
import { createState, untracked, type InitializedObservable } from 'synstate';
import type {
  AnyRoutes,
  Blocker,
  BlockerState,
  NavigationAttempt,
  Router,
} from 'synstate-router';
import { useObservableValue } from './use-observable-value.mjs';

/** `useBlocker` bound to `router` (`ReactRouter['useBlocker']`). */
export const createUseBlocker = <R extends AnyRoutes>(
  router: Router<R>,
): ((
  shouldBlock: (attempt: NavigationAttempt<R>) => boolean,
) => BlockerState<R>) => {
  // What a component reads before its blocker is registered, and after; made
  // outside every scope, as the router's own observables are.
  const [idle$] = untracked(() =>
    createState<BlockerState<R>>({ status: 'idle' }),
  );

  const useBlocker = (
    shouldBlock: (attempt: NavigationAttempt<R>) => boolean,
  ): BlockerState<R> => {
    // The latest function, so that a blocker reading this render's values needs
    // no new registration.
    const latest = React.useRef(shouldBlock);

    React.useLayoutEffect(() => {
      latest.current = shouldBlock;
    });

    const [blocker, setBlocker] = React.useState<Blocker<R> | undefined>(
      undefined,
    );

    // Registered in an effect, so that a render that is thrown away, and the
    // second mount of Strict Mode, leave no blocker behind.
    React.useEffect(() => {
      const registered = router.block((attempt) => latest.current(attempt));

      setBlocker(registered);

      return () => {
        registered.dispose();

        setBlocker(undefined);
      };
    }, []);

    const state$: InitializedObservable<BlockerState<R>> =
      blocker?.state ?? idle$;

    return useObservableValue(state$);
  };

  return useBlocker;
};
