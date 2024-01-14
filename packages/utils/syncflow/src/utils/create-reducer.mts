import { Maybe } from '@noshiro/ts-utils';
import {
  source,
  withInitialValue,
  type InitializedObservable,
} from '../core/index.mjs';

export const createReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): [InitializedObservable<S>, (action: A) => S] => {
  const state$ = source<S>();

  const dispatch = (action: A): S => {
    const nextState = reducer(
      Maybe.unwrapOr(state$.snapshot, initialState),
      action,
    );
    state$.next(nextState);
    return nextState;
  };

  return [state$.chain(withInitialValue(initialState)), dispatch];
};
