import {
  state as createStateNode,
  type InitializedObservable,
  type StateOptions,
} from '../core/index.mjs';

/**
 * A state as a tuple of the observable, its setter and the rest, for code that
 * passes them to different places. The setters return nothing: a write made
 * while an update propagates is applied once it ends, so what it would return
 * is not known yet. Read the state with `getSnapshot`.
 */
export const createState = <S,>(
  initialState: S,
  options?: StateOptions<NoInfer<S>>,
): readonly [
  state: InitializedObservable<S>,
  setState: (next: S) => void,
  utils: Readonly<{
    /**
     * Writes `updateFn(current)`. During propagation `updateFn` itself waits,
     * so that it reads the state the writes before it left.
     */
    updateState: (updateFn: (current: S) => S) => void;
    resetState: () => void;
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const node = createStateNode(initialState, options);

  return [
    node,
    (next) => {
      node.set(next);
    },
    {
      updateState: (updateFn) => {
        node.update(updateFn);
      },
      resetState: () => {
        node.set(initialState);
      },
      getSnapshot: () => node.value,
      initialState,
    },
  ] as const;
};
