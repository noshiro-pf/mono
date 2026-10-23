// The other file of `no-write-during-propagation.typed.test.mts`: states
// made here and imported there, as a store module and the code subscribing
// to it would be.
import * as synstate from 'synstate';
import { createState, source } from 'synstate';

export const [count$, setCount, { resetState: resetCount }] = createState(0);

export const [label$, setLabel] = synstate.createState('');

export const tick$ = source<number>();

/** Not a write: the getter of a state. */
export const [flag$, , { getSnapshot: getFlag }] = createState(false);

export { setCount as reexportedSetCount };
