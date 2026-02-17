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
 * @returns An object containing the state observable and methods to manipulate it
 *
 * @example
 * ```ts
 * const [state, setState, { updateState, resetState }] = createState(0);
 *
 * state.subscribe((value: number) => {
 *   console.log(value);
 * }); // logs: 0
 *
 * setState(10); // logs: 10
 *
 * updateState((prev: number) => prev + 1); // logs: 11
 *
 * resetState(); // logs: 0
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
  }>,
] => {
  const [state, dispatch, getSnapshot] = createReducer<S, Action<S>>(
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
    },
  ] as const;
};

/**
 * Creates a reactive boolean state with convenient methods for boolean operations.
 * Extends `createState` with boolean-specific helpers like `toggle`, `setTrue`, and `setFalse`.
 *
 * @param initialState - The initial boolean value
 * @returns An object with the state observable and boolean-specific methods
 *
 * @example
 * ```ts
 * const [state, { setTrue, toggle }] = createBooleanState(false);
 *
 * state.subscribe((value: boolean) => {
 *   console.log(value);
 * }); // logs: false
 *
 * setTrue(); // logs: true
 *
 * toggle(); // logs: false
 *
 * toggle(); // logs: true
 * ```
 */
export const createBooleanState = (
  initialState: boolean,
): readonly [
  state: InitializedObservable<boolean>,
  Readonly<{
    setTrue: () => void;
    setFalse: () => void;
    setState: (next: boolean) => boolean;
    toggle: () => boolean;
    updateState: (updateFn: (prev: boolean) => boolean) => boolean;
    resetState: () => boolean;
    getSnapshot: () => boolean;
  }>,
] => {
  const [state, setState, { updateState, resetState, getSnapshot }] =
    createState(initialState);

  return [
    state,
    {
      setTrue: () => {
        setState(true);
      },
      setFalse: () => {
        setState(false);
      },
      toggle: () => updateState((s) => !s),
      setState,
      updateState,
      resetState,
      getSnapshot,
    },
  ] as const;
};
