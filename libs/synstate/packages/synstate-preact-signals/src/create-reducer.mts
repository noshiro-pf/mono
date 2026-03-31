import { type ReadonlySignal } from '@preact/signals';
import {
  createReducer as createReducerBase,
  type InitializedObservable,
} from 'synstate';
import { toSignal } from './to-signal.mjs';

/**
 * Creates a synstate reducer with a `ReadonlySignal` for reading the current
 * value in Preact components.
 *
 * @example
 * ```ts
 * type Action = Readonly<{ type: 'increment' } | { type: 'decrement' }>;
 *
 * const [countSignal, dispatch, { getSnapshot }] = createReducer(
 *   (state: number, action: Action) =>
 *     action.type === 'increment' ? state + 1 : state - 1,
 *   0,
 * );
 *
 * assert.strictEqual(countSignal.value, 0);
 *
 * dispatch({ type: 'increment' });
 *
 * assert.strictEqual(countSignal.value, 1);
 *
 * dispatch({ type: 'increment' });
 *
 * assert.strictEqual(countSignal.value, 2);
 *
 * dispatch({ type: 'decrement' });
 *
 * assert.strictEqual(countSignal.value, 1);
 *
 * assert.strictEqual(getSnapshot(), 1);
 * ```
 */
export const createReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
): readonly [
  signal: ReadonlySignal<S>,
  dispatch: (action: A) => S,
  Readonly<{
    state: InitializedObservable<S>;
    getSnapshot: () => S;
  }>,
] => {
  const [state, dispatch, getSnapshot] = createReducerBase(
    reducer,
    initialState,
  );

  const sig = toSignal(state);

  return [sig, dispatch, { state, getSnapshot }];
};
