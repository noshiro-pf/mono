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
}> => {
  const { state: st, dispatch } = createReducerBase(reducer, initialState);

  const useCurrentValue = (): S => useObservableValue(st);

  return { state: st, dispatch, useCurrentValue };
};
