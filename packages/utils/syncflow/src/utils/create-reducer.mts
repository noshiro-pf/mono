import {
  setInitialValue,
  source,
  type InitializedObservable,
} from '../core/index.mjs';

export const createReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): Readonly<{
  state: InitializedObservable<S>;
  dispatch: (action: A) => S;
  getSnapshot: () => S;
}> => {
  const src = source<S>();

  const state_ = src.chain(setInitialValue(initialState));

  const dispatch = (action: A): S => {
    const nextState = reducer(state_.getSnapshot().value, action);

    src.next(nextState);

    return nextState;
  };

  const getSnapshot = (): S => state_.getSnapshot().value;

  return {
    state: state_,
    dispatch,
    getSnapshot,
  };
};
