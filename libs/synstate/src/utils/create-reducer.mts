import type { ReplaceEqualDeepOptions } from 'ts-data-forge';
import type { Reducer } from 'ts-type-forge';
import type { InitializedObservable } from '../core/index.mjs';
import { createStateSource } from './state-source.mjs';

/**
 * Creates a reducer-based state management container following the Redux pattern.
 * Actions are dispatched to update the state according to the reducer function.
 *
 * @template S - The type of the state
 * @template A - The type of actions
 * @param reducer - A pure function that takes current state and action, returns new state
 * @param initialState - The initial value of the state
 * @param options - {@link StateOptions}: `equals` (default `Object.is`),
 *   to pass on only the dispatches that change the state, and
 *   `keepEqualParts`, to keep the parts of the state a dispatch did not change
 * @returns A 3-element tuple: `[state, dispatch, { getSnapshot, initialState }]`.
 *   `dispatch` returns the state it leaves; once `state` is completed, that
 *   is the state held.
 *
 * @example
 * ```ts
 * const [state, dispatch] = createReducer(
 *   (s, action: Readonly<{ type: 'increment' } | { type: 'decrement' }>) => {
 *     switch (action.type) {
 *       case 'increment':
 *         return s + 1;
 *       case 'decrement':
 *         return s - 1;
 *     }
 *   },
 *   0,
 * );
 *
 * const stateHistory: number[] = [];
 *
 * state.subscribe((value: number) => {
 *   stateHistory.push(value);
 * });
 *
 * assert.deepStrictEqual(stateHistory, [0]);
 *
 * dispatch({ type: 'increment' }); // logs: 1
 *
 * assert.deepStrictEqual(stateHistory, [0, 1]);
 *
 * dispatch({ type: 'increment' });
 *
 * dispatch({ type: 'decrement' });
 *
 * assert.deepStrictEqual(stateHistory, [0, 1, 2, 1]);
 * ```
 *
 * @example
 * ```ts
 * const [count, dispatch] = createReducer(
 *   (s, action: Readonly<{ type: 'add'; amount: number }>) =>
 *     s + action.amount,
 *   0,
 *   { equals: () => false },
 * );
 *
 * const countHistory: number[] = [];
 *
 * count.subscribe((value: number) => {
 *   countHistory.push(value);
 * });
 *
 * dispatch({ type: 'add', amount: 0 }); // 0 again, passed on all the same
 *
 * dispatch({ type: 'add', amount: 2 });
 *
 * assert.deepStrictEqual(countHistory, [0, 0, 2]);
 * ```
 *
 * @note Do not call `dispatch` from a subscriber or a projection while another
 * update is propagating: the write propagates immediately, so subscribers can
 * see an intermediate state, and it logs a `console.warn` (once per
 * observable). Derive the value from its source instead —
 * `const b$ = a$.pipe(map((a) => a * 2))` rather than
 * `a$.subscribe((a) => { setB(a * 2); })`.
 */
export const createReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  options?: StateOptions<NoInfer<S>>,
): readonly [
  state: InitializedObservable<S>,
  dispatch: (action: A) => S,
  utils: Readonly<{
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const { state, getSnapshot, commit } = createStateSource(
    initialState,
    options,
  );

  const dispatch = (action: A): S => {
    const currentState = getSnapshot();

    return commit(currentState, reducer(currentState, action));
  };

  return [state, dispatch, { getSnapshot, initialState }] as const;
};

/**
 * Options of {@link createReducer}, `createState` and `createBooleanState`.
 */
export type StateOptions<S> = Readonly<{
  /**
   * Whether the next state is the same as the current one. When it says so, the
   * update is not passed on — no subscriber, and nothing derived from the
   * state, is told of it — and the current state is kept, along with its
   * identity: `setState` and the like return the current state rather than the
   * next.
   *
   * Decide here, where the state is held, rather than downstream with
   * `skipIfNoChange`: an update passed on here reaches whatever reads the state
   * directly before any operator can thin it out.
   *
   * Defaults to `Object.is`, so writing the value already held passes nothing
   * on. Pass `() => false` to pass on every update, equal or not.
   *
   * @param current - The state held now
   * @param next - The state the update would set
   */
  equals?: (current: S, next: S) => boolean;

  /**
   * Whether an update keeps the parts of the state it did not change. With
   * `true`, the next state is compared with the current one before it is
   * written, and every part of it deeply equal to the same part of the current
   * state is replaced by that part (`replaceEqualDeep` of
   * ts-data-forge): a reader of an unchanged part keeps the object it has, so
   * `map`, comparing with `Object.is`, stops there. When the whole next state is
   * deeply equal, the current state is kept and nothing is passed on, so
   * `equals` can stay `Object.is`.
   *
   * This is for a state written whole from a source that answers with a new
   * object every time, a server polled for a report, say. Array items are
   * matched by index; pass `{ key }` to match them by key, an item for which
   * `key` returns `undefined` being matched by index. Only plain objects and
   * arrays are walked into; a `Map`, a `Set`, a `Date` or a class instance is
   * compared and kept whole.
   *
   * Prefer this over `keepEqualParts()` downstream: keeping the parts where the
   * state is written means no update with nothing in it is passed on at all,
   * and nothing downstream has anything to undo.
   *
   * Defaults to `false`: the next state is written as given. With it on, each
   * update compares deeply every part of the next state that is not the very
   * object of the current one; a state whose updates already keep what they do
   * not change, as `{ ...prev, x }` does, gains nothing from it.
   */
  keepEqualParts?: boolean | ReplaceEqualDeepOptions;
}>;
