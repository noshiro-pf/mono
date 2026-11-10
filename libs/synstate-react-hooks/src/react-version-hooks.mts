import * as React from 'react';

/**
 * The hooks that differ between the React versions this package and
 * synstate-react-hooks-compat support. This package needs React 18, so they
 * are React's own.
 *
 * synstate-react-hooks-compat has its own version of this file, for React 16.8
 * and later; every file that imports it is the same in both packages
 * (`check:root:synstate-hooks-copies`).
 */

/** The effect that runs before the layout and passive effects of a commit. */
export const useBeforeEffects: typeof React.useInsertionEffect =
  React.useInsertionEffect;
