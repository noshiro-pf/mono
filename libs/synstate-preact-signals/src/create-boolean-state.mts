import { type ReadonlySignal } from '@preact/signals';
import {
  type InitializedObservable,
  createBooleanState as createBooleanStateBase,
} from 'synstate';
import { toSignal } from './to-signal.mjs';

/**
 * Creates a synstate boolean state with a `ReadonlySignal` for reading the
 * current value in Preact components.
 *
 * @example
 * ```ts
 * // eslint-disable-next-line @typescript-eslint/no-shadow
 * const [isOpenSignal, { setTrue: open, setFalse: close, toggle }] =
 *   createBooleanState(false);
 *
 * assert.strictEqual(isOpenSignal.value, false);
 *
 * open();
 *
 * assert.strictEqual(isOpenSignal.value, true);
 *
 * close();
 *
 * assert.strictEqual(isOpenSignal.value, false);
 *
 * toggle();
 *
 * assert.strictEqual(isOpenSignal.value, true);
 * ```
 */
export const createBooleanState = (
  initialState: boolean,
): readonly [
  signal: ReadonlySignal<boolean>,
  utils: Readonly<{
    state: InitializedObservable<boolean>;
    setTrue: () => void;
    setFalse: () => void;
    setState: (next: boolean) => boolean;
    toggle: () => boolean;
    updateState: (updateFn: (prev: boolean) => boolean) => boolean;
    resetState: () => boolean;
    getSnapshot: () => boolean;
    initialState: boolean;
  }>,
] => {
  const [
    state,
    {
      setTrue,
      setFalse,
      setState,
      toggle,
      updateState,
      resetState,
      getSnapshot,
    },
  ] = createBooleanStateBase(initialState);

  const sig = toSignal(state);

  return [
    sig,
    {
      state,
      setTrue,
      setFalse,
      setState,
      toggle,
      updateState,
      resetState,
      getSnapshot,
      initialState,
    },
  ] as const;
};
