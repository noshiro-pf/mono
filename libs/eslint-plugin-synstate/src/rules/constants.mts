export const SYNSTATE_MODULE = 'synstate';

/**
 * synstate and the packages that re-export it and wrap its factories, keeping
 * their names and the places of their writers (`createState`'s setter is still
 * `[1]`). The hooks packages among them also export `useObservableEffect`,
 * whose callback is a subscriber.
 */
export const SYNSTATE_AND_WRAPPER_MODULES: readonly string[] = [
  SYNSTATE_MODULE,
  'synstate-preact-hooks',
  'synstate-preact-signals',
  'synstate-react-hooks',
  'synstate-react-hooks-compat',
] as const;
