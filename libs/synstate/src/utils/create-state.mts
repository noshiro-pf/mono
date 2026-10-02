import { type InitializedObservable } from '../core/index.mjs';
import { createReducer, type StateOptions } from './create-reducer.mjs';

type Action<S> = Readonly<
  | {
      type: 'set';
      nextState: S;
    }
  | {
      type: 'update';
      updateFn: (a: S) => S;
    }
>;

const reducer = <S,>(state: S, action: Action<S>): S => {
  switch (action.type) {
    case 'set':
      return action.nextState;

    case 'update':
      return action.updateFn(state);
  }
};

/**
 * Creates a reactive state container with getter and setter methods.
 * Provides a simple state management solution with observable state.
 *
 * @template S - The type of the state
 * @param initialState - The initial value of the state
 * @param options - {@link StateOptions}: `equals`, to pass on only the
 *   updates that change the state
 * @returns A 3-element tuple: `[state, setState, { updateState, resetState, getSnapshot, initialState }]`
 *
 * @example
 * ```ts
 * const [state, setState, { updateState, resetState }] = createState(0);
 *
 * const stateHistory: number[] = [];
 *
 * state.subscribe((value: number) => {
 *   stateHistory.push(value);
 * });
 *
 * assert.deepStrictEqual(stateHistory, [0]);
 *
 * setState(10); // logs: 10
 *
 * assert.deepStrictEqual(stateHistory, [0, 10]);
 *
 * updateState((prev: number) => prev + 1); // logs: 11
 *
 * assert.deepStrictEqual(stateHistory, [0, 10, 11]);
 *
 * resetState(); // logs: 0
 *
 * assert.deepStrictEqual(stateHistory, [0, 10, 11, 0]);
 * ```
 *
 * @example
 * ```ts
 * const [filters, setFilters] = createState(
 *   { label: 'bug', page: 1 },
 *   { equals: fastDeepEqual },
 * );
 *
 * const before = filters.getSnapshot().value;
 *
 * // Derived state is recomputed only when the state really changes.
 * const query = filters.pipe(
 *   map(({ label, page }) => `label:${label} page:${page}`),
 * );
 *
 * const queryHistory: string[] = [];
 *
 * query.subscribe((value: string) => {
 *   queryHistory.push(value);
 * });
 *
 * setFilters({ label: 'bug', page: 1 }); // equal: nothing is passed on
 *
 * assert.strictEqual(filters.getSnapshot().value, before);
 *
 * setFilters({ label: 'bug', page: 2 });
 *
 * assert.deepStrictEqual(queryHistory, [
 *   'label:bug page:1',
 *   'label:bug page:2',
 * ]);
 * ```
 */
export const createState = <S,>(
  initialState: S,
  options?: StateOptions<NoInfer<S>>,
): readonly [
  state: InitializedObservable<S>,
  setState: (v: S) => S,
  utils: Readonly<{
    updateState: (updateFn: (prev: S) => S) => S;
    resetState: () => S;
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const [state, dispatch, { getSnapshot }] = createReducer<S, Action<S>>(
    reducer,
    initialState,
    options,
  );

  const updateState = (updateFn: (prev: S) => S): S =>
    dispatch({ type: 'update', updateFn });

  const setState = (nextState: S): S => dispatch({ type: 'set', nextState });

  const resetState = (): S =>
    dispatch({ type: 'set', nextState: initialState });

  return [
    state,
    setState,
    {
      updateState,
      resetState,
      getSnapshot,
      initialState,
    },
  ] as const;
};
