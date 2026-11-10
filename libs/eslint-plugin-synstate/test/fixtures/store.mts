// A store module for `no-write-during-propagation.typed.test.mts`: states made
// here and imported there, as a store module and the code subscribing to it
// would be (`lookalike.mts` is a module this one makes look-alike states with).
import * as synstate from 'synstate';
import { createState, source } from 'synstate';
import * as lookalike from './lookalike.mjs';

export const [count$, setCount, { resetState: resetCount }] = createState(0);

export const [label$, setLabel] = synstate.createState('');

/** Made through the namespace under `satisfies`. */
export const [, setTitle] = (synstate satisfies typeof synstate).createState(
  '',
);

/** Made through the namespace under `as`. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- the wrapper is what the rule is tested to see through
export const [, setSubtitle] = (synstate as typeof synstate).createState('');

/** Made through the namespace under a bare `!`. */
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion -- the wrapper is what the rule is tested to see through
export const [, setNote] = synstate!.createState('');

/** Not a write: made the same way through a module that is not synstate. */
export const [, setLookalike] = (
  lookalike satisfies typeof lookalike
).createState('');

export const tick$ = source<number>();

/** Not a write: the getter of a state. */
export const [flag$, , { getSnapshot: getFlag }] = createState(false);

export { setCount as reexportedSetCount };
