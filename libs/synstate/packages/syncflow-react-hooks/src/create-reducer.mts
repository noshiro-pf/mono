import {
  createReducer as createReducerBase,
  type InitializedObservable,
} from 'syncflow';
import { useObservableValue } from './use-observable-value.mjs';

export const createReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
): readonly [
  useCurrentValue: () => S,
  dispatch: (action: A) => S,
  Readonly<{
    state: InitializedObservable<S>;
    getSnapshot: () => S;
  }>,
] => {
  const [state, dispatch, getSnapshot] = createReducerBase(
    reducer,
    initialState,
  );

  const useCurrentValue = (): S => useObservableValue(state);

  return [useCurrentValue, dispatch, { state, getSnapshot }];
};
