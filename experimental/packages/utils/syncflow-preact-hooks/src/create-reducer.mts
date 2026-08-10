import {
  createReducer as createReducerBase,
  type InitializedObservable,
} from '@noshiro/syncflow';
import { useObservableValue } from './use-observable.mjs';

export const createReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): Readonly<{
  state: InitializedObservable<S>;
  dispatch: (action: A) => S;
  useCurrentValue: () => S;
  getSnapshot: () => S;
}> => {
  const {
    state: state_,
    dispatch,
    getSnapshot,
  } = createReducerBase(reducer, initialState);

  const useCurrentValue = (): S => useObservableValue(state_);

  return { state: state_, dispatch, useCurrentValue, getSnapshot };
};
