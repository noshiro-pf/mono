import {
  state,
  type InitializedObservable,
  type StateOptions,
} from '../core/index.mjs';

/**
 * A state written only by `dispatch`, through `reducer`. A dispatch while the
 * graph drains waits until that round's effects have run, and then reduces the
 * state the writes before it left. `dispatch` returns nothing; read the state
 * with `getSnapshot`.
 */
export const createReducer = <S, A>(
  reducer: (current: S, action: A) => S,
  initialState: S,
  options?: StateOptions<NoInfer<S>>,
): readonly [
  state: InitializedObservable<S>,
  dispatch: (action: A) => void,
  utils: Readonly<{
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const node = state(initialState, options);

  return [
    node,
    (action) => {
      node.update((current) => reducer(current, action));
    },
    { getSnapshot: () => node.value, initialState },
  ] as const;
};
