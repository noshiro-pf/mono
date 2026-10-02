import { type Reducer } from 'ts-type-forge';
import { source, type InitializedObservable } from '../core/index.mjs';

/**
 * Creates a reducer-based state management container following the Redux pattern.
 * Actions are dispatched to update the state according to the reducer function.
 *
 * @template S - The type of the state
 * @template A - The type of actions
 * @param reducer - A pure function that takes current state and action, returns new state
 * @param initialState - The initial value of the state
 * @param options - {@link StateOptions}: `equals`, to pass on only the
 *   dispatches that change the state
 * @returns A 3-element tuple: `[state, dispatch, { getSnapshot, initialState }]`
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
 *   { equals: Object.is },
 * );
 *
 * const countHistory: number[] = [];
 *
 * count.subscribe((value: number) => {
 *   countHistory.push(value);
 * });
 *
 * dispatch({ type: 'add', amount: 0 }); // 0 again: nothing is passed on
 *
 * dispatch({ type: 'add', amount: 2 });
 *
 * assert.deepStrictEqual(countHistory, [0, 2]);
 * ```
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
  const state = source<S>(initialState);

  const equals = options?.equals;

  const dispatch = (action: A): S => {
    const currentState = state.getSnapshot().value;

    const nextState = reducer(currentState, action);

    if (equals?.(currentState, nextState) === true) {
      return currentState;
    }

    state.next(nextState);

    return nextState;
  };

  const getSnapshot = (): S => state.getSnapshot().value;

  return [state, dispatch, { getSnapshot, initialState }] as const;
};

/**
 * Options of {@link createReducer}, `createState` and `createBooleanState`.
 */
export type StateOptions<S> = Readonly<{
  /**
   * Whether the next state is the same as the current one. When it says so,
   * the update is not passed on — no subscriber, and nothing derived from
   * the state, is told of it — and the current state is kept, along with its
   * identity: `setState` and the like return the current state rather than
   * the next.
   *
   * Decide here, where the state is held, rather than downstream with
   * `skipIfNoChange`: an update passed on here reaches whatever reads the
   * state directly before any operator can thin it out.
   *
   * When omitted, every update is passed on, equal or not. That default is
   * stocked in `NEXT_MAJOR.md` to become `Object.is`.
   *
   * @param current - The state held now
   * @param next - The state the update would set
   */
  equals?: (current: S, next: S) => boolean;
}>;
