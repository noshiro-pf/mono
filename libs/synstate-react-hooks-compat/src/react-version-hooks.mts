import * as React from 'react';

/**
 * The hooks that differ between the React versions synstate-react-hooks and
 * this package support. This package supports React 16.8 and later, so they
 * fall back where React has none.
 *
 * synstate-react-hooks has its own version of this file, React's hooks alone;
 * every file that imports it is the same in both packages
 * (`check:root:synstate-hooks-copies`).
 */

/**
 * The effect that runs before the layout and passive effects of a commit on
 * React 18 and later: `useInsertionEffect`.
 *
 * `useInsertionEffect` is React 18's (`'useInsertionEffect' in React` narrows
 * to `never`, as the types have it). Before it, `useLayoutEffect` comes
 * closest, running before the passive effects only; it warns when rendered on
 * the server, where nothing emits anyway, so `useEffect` stands in there.
 */
export const useBeforeEffects: typeof React.useLayoutEffect =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- React 16 and 17 have none, whatever the types say
  React.useInsertionEffect ??
  (typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect);
