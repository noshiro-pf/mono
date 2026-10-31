import { replaceEqualDeep } from 'ts-data-forge';
import { source, type InitializedSourceObservable } from '../core/index.mjs';
import type { StateOptions } from './create-reducer.mjs';

/**
 * What `createState` and `createReducer` are both built on: the source holding
 * the state, its current value, and `commit`, the one way either writes it.
 * `commit` writes `reduced` unless `equals` finds it the same as
 * `currentState`, after keeping the parts of `currentState` it did not change
 * when `keepEqualParts` asks for that, and returns the state written, or
 * `currentState` when nothing was.
 *
 * Not part of the package's API: `gen:index:src` leaves this file out of the
 * barrel.
 */
export const createStateSource = <S,>(
  initialState: S,
  options: StateOptions<S> | undefined,
): Readonly<{
  state: InitializedSourceObservable<S>;
  getSnapshot: () => S;
  commit: (currentState: S, reduced: S) => S;
}> => {
  const state = source<S>(initialState);

  const getSnapshot = (): S => state.getSnapshot().value;

  const equals = options?.equals ?? Object.is;

  const keepEqualParts = options?.keepEqualParts ?? false;

  const keepOptions =
    typeof keepEqualParts === 'boolean' ? undefined : keepEqualParts;

  const commit = (currentState: S, reduced: S): S => {
    const nextState =
      keepEqualParts === false
        ? reduced
        : replaceEqualDeep(currentState, reduced, keepOptions);

    // Once completed, `next` keeps the state held and returns it.
    return equals(currentState, nextState)
      ? currentState
      : state.next(nextState);
  };

  return { state, getSnapshot, commit };
};
