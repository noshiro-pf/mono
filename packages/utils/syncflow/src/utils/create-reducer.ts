import { Option } from '@noshiro/ts-utils';
import type { InitializedObservable } from '../core';
import { source, withInitialValue } from '../core';

export const createReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [InitializedObservable<S>, (action: A) => S] => {
  const state$ = source<S>();

  const dispatch = (action: A): S => {
    const nextState = reducer(
      Option.unwrapOr(state$.currentValue, initialState),
      action
    );
    state$.next(nextState);
    return nextState;
  };

  return [state$.chain(withInitialValue(initialState)), dispatch];
};
