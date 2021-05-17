import type { ReducerType } from '@noshiro/ts-utils';
import { useCallback, useEffect, useRef, useState } from 'preact/compat';

type AsyncDispatch<S, A> = (action: A) => Promise<S>;
type SyncSetState<S> = (updateFn: (prevState: S) => S) => void;

export const useAsyncDispatchFunction = <S, A>(
  state: S,
  reducer: ReducerType<S, A>,
  setState: SyncSetState<S>
): AsyncDispatch<S, A> => {
  // hold resolution function for all setState calls still unresolved
  const resolvers = useRef<((_state: S) => void)[]>([]);

  // ensure resolvers are called once state updates have been applied
  useEffect(() => {
    resolvers.current.forEach((resolve) => {
      resolve(state);
    });
    resolvers.current = [];
  }, [state]);

  // make setState return a promise
  return useCallback(
    (action: A) => {
      return new Promise<S>((resolve, reject) => {
        setState((stateBefore) => {
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
          } catch (e: unknown) {
            reject(e);
            throw e;
          }
        });
      });
    },
    [setState, reducer]
  );
};

export const useAsyncReducer = <S, A>(
  reducer: ReducerType<S, A>,
  init: S
): [S, AsyncDispatch<S, A>] => {
  const [state, setState] = useState(init);
  const dispatchAsync = useAsyncDispatchFunction(state, reducer, setState);
  return [state, dispatchAsync];
};
