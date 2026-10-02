import {
  createReducer as createReducerBase,
  type InitializedObservable,
  type StateOptions,
} from 'synstate';
import { type Reducer } from 'ts-type-forge';
import { useObservableValue } from './use-observable-value.mjs';

export const createReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  options?: StateOptions<NoInfer<S>>,
): readonly [
  useCurrentValue: () => S,
  dispatch: (action: A) => S,
  utils: Readonly<{
    state: InitializedObservable<S>;
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const [state, dispatch, { getSnapshot }] = createReducerBase(
    reducer,
    initialState,
    options,
  );

  const useCurrentValue = (): S => useObservableValue(state);

  return [useCurrentValue, dispatch, { state, getSnapshot, initialState }];
};
