import { type InitializedObservable } from '../core/index.mjs';
import { createReducer } from './create-reducer.mjs';

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
 */
export const createState = <S,>(
  initialState: S,
): readonly [
  state: InitializedObservable<S>,
  setState: (v: S) => S,
  Readonly<{
    updateState: (updateFn: (prev: S) => S) => S;
    resetState: () => S;
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const [state, dispatch, { getSnapshot }] = createReducer<S, Action<S>>(
    reducer,
    initialState,
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
