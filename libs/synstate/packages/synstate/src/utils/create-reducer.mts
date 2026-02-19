import { source, type InitializedObservable } from '../core/index.mjs';

/**
 * Creates a reducer-based state management container following the Redux pattern.
 * Actions are dispatched to update the state according to the reducer function.
 *
 * @template S - The type of the state
 * @template A - The type of actions
 * @param reducer - A pure function that takes current state and action, returns new state
 * @param initialState - The initial value of the state
 * @returns An object containing the state observable, dispatch function, and snapshot getter
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
 * const mut_history: number[] = [];
 *
 * state.subscribe((value: number) => {
 *   mut_history.push(value);
 * });
 *
 * assert.deepStrictEqual(mut_history, [0]);
 *
 * dispatch({ type: 'increment' }); // logs: 1
 *
 * assert.deepStrictEqual(mut_history, [0, 1]);
 *
 * dispatch({ type: 'increment' });
 *
 * dispatch({ type: 'decrement' });
 *
 * assert.deepStrictEqual(mut_history, [0, 1, 2, 1]);
 * ```
 */
export const createReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
): readonly [
  state: InitializedObservable<S>,
  dispatch: (action: A) => S,
  getSnapshot: () => S,
] => {
  const state = source<S>(initialState);

  const dispatch = (action: A): S => {
    const nextState = reducer(state.getSnapshot().value, action);

    state.next(nextState);

    return nextState;
  };

  const getSnapshot = (): S => state.getSnapshot().value;

  return [state, dispatch, getSnapshot] as const;
};
