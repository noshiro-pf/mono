import { type ReadonlySignal } from '@preact/signals';
import {
  createState as createStateBase,
  type InitializedObservable,
} from 'synstate';
import { toSignal } from './to-signal.mjs';

/**
 * Creates a synstate state with a `ReadonlySignal` for reading the current
 * value in Preact components.
 *
 * Unlike `synstate-preact-hooks`' `createState` which returns a hook, this
 * returns a `ReadonlySignal` that can be embedded directly in JSX without
 * hooks, enabling fine-grained DOM updates.
 *
 * @example
 * ```ts
 * const [countSignal, setCount, { updateState, resetState, getSnapshot }] =
 *   createState(0);
 *
 * assert.strictEqual(countSignal.value, 0);
 *
 * setCount(5);
 *
 * assert.strictEqual(countSignal.value, 5);
 *
 * updateState((prev) => prev + 1);
 *
 * assert.strictEqual(countSignal.value, 6);
 *
 * resetState();
 *
 * assert.strictEqual(countSignal.value, 0);
 *
 * assert.strictEqual(getSnapshot(), 0);
 * ```
 */
export const createState = <S,>(
  initialState: S,
): readonly [
  signal: ReadonlySignal<S>,
  setState: (v: S) => S,
  Readonly<{
    state: InitializedObservable<S>;
    updateState: (updateFn: (prev: S) => S) => S;
    resetState: () => S;
    getSnapshot: () => S;
  }>,
] => {
  const [state, setState, { updateState, resetState, getSnapshot }] =
    createStateBase(initialState);

  const sig = toSignal(state);

  return [
    sig,
    setState,
    {
      state,
      updateState,
      resetState,
      getSnapshot,
    },
  ] as const;
};
