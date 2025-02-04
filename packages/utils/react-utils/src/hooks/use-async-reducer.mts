import { useState } from 'better-react-use-state';
import { useCallback, useEffect, useRef } from 'react';

type AsyncDispatch<S, A> = (action: A) => Promise<S>;
type UpdateStateFn<S> = (updateFn: (prevState: S) => S) => void;

export const useAsyncDispatchFunction = <S, A>(
  state: S,
  reducer: Reducer<S, A>,
  updateState: UpdateStateFn<S>,
): AsyncDispatch<S, A> => {
  // hold resolution function for all setState calls still unresolved
  const resolvers = useRef<((_state: S) => void)[]>([]);

  // ensure resolvers are called once state updates have been applied
  useEffect(() => {
    for (const resolve of resolvers.current) {
      resolve(state);
    }
    resolvers.current = [];
  }, [state]);

  // make setState return a promise
  return useCallback(
    (action: A) =>
      new Promise<S>((resolve, reject) => {
        updateState((stateBefore) => {
          try {
            const stateAfter = reducer(stateBefore, action);

            // If state does not change, we must resolve the promise because react won't re-render and effect will not resolve
            if (stateAfter === stateBefore) {
              resolve(stateAfter);
            }
            // Else we queue resolution until next state change
            else {
              resolvers.current.push(resolve);
            }
            return stateAfter;
          } catch (error: unknown) {
            reject(error);
            // FIXME
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw error;
          }
        });
      }),
    [updateState, reducer],
  );
};

export const useAsyncReducer = <S, A>(
  reducer: Reducer<S, A>,
  init: S,
): [S, AsyncDispatch<S, A>] => {
  const [state, _, { updateState }] = useState(init);
  const dispatchAsync = useAsyncDispatchFunction(state, reducer, updateState);
  return [state, dispatchAsync];
};
