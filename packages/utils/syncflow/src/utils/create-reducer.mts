import { Maybe } from '@noshiro/ts-utils';
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
}> => {
  const src = source<S>();

  const dispatch = (action: A): S => {
    const nextState = reducer(
      Maybe.unwrapOr(src.getSnapshot(), initialState),
      action,
    );

    src.next(nextState);

    return nextState;
  };

  return {
    state: src.chain(setInitialValue(initialState)),
    dispatch,
  };
};
