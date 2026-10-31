import {
  createValueEmitter,
  type InitializedObservable,
  mapTo,
  merge,
  scan,
  type Observable as SynstateObservable,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr, match } from 'ts-data-forge';
import type { Reducer } from 'ts-type-forge';

/**
 * `createReducer` of `synstate-react-hooks`, whose state also follows
 * `actions`: observables of actions derived from elsewhere, such as a reset
 * when a page is left.
 *
 * Dispatching those from a subscriber of their source would be a write while an
 * update propagates, which synstate warns about; here they are part of the
 * graph instead.
 */
export const createReducerWithActions = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  actions: readonly SynstateObservable<NoInfer<A>>[],
): readonly [
  useCurrentValue: () => S,
  dispatch: (action: A) => S,
  utils: Readonly<{
    state: InitializedObservable<S>;
    getSnapshot: () => S;
    initialState: S;
  }>,
] => {
  const [dispatched$, emit] = createValueEmitter<A>();

  const state = merge(Arr.toUnshifted(dispatched$)(actions)).pipe(
    scan(reducer, initialState),
  );

  const getSnapshot = (): S => state.getSnapshot().value;

  const dispatch = (action: A): S => {
    emit(action);

    return getSnapshot();
  };

  const useCurrentValue = (): S => useObservableValue(state);

  return [useCurrentValue, dispatch, { state, getSnapshot, initialState }];
};

/**
 * A boolean that starts `false`, that `toggle` flips, and that each of `resets`
 * sets back to `false` when it emits — a password field's lock that closes when
 * the form is left, say.
 */
export const createToggleState = (
  resets: readonly SynstateObservable<unknown>[],
): Readonly<{
  state: InitializedObservable<boolean>;
  toggle: () => void;
}> => {
  const [, dispatch, { state }] = createReducerWithActions(
    (isOn: boolean, action: 'toggle' | 'reset') =>
      match(action, { toggle: !isOn, reset: false }),
    false,
    resets.map((reset$) => reset$.pipe(mapTo('reset'))),
  );

  return {
    state,
    toggle: () => {
      dispatch('toggle');
    },
  };
};
