import { map, type InitializedObservable } from 'synstate';
import { Optional } from 'ts-data-forge';
import { createReducerWithActions } from '../utils/index.mjs';

/**
 * Whether an input shows its error: from a blur or change (`touch`) that finds
 * it invalid, until `invalid$` says it is valid again, for whatever reason (a
 * change, or what it is checked against changing). One made invalid by
 * something else, such as a reset of the form, shows nothing until touched.
 *
 * Returns the flag and `touch`, for the input's blur and, once the value has
 * been set, its change: `touch` reads the validity as it is then.
 */
export const createFormError = (
  invalid$: InitializedObservable<boolean>,
): readonly [
  errorShown$: InitializedObservable<boolean>,
  touch: () => void,
] => {
  // The validity is one of the reducer's sources rather than a subscriber that
  // writes, so the flag follows it in the update that changes it.
  const [state$, dispatch] = createReducerWithActions(
    reducer,
    { shown: false, invalid: Optional.unwrap(invalid$.getSnapshot()) },
    [invalid$.pipe(map((invalid): Action => ({ type: 'validity', invalid })))],
  );

  const errorShown$ = state$.pipe(map((s) => s.shown));

  const touch = (): void => {
    dispatch({ type: 'touch' });
  };

  return [errorShown$, touch];
};

type State = Readonly<{ shown: boolean; invalid: boolean }>;

type Action = Readonly<
  { type: 'touch' } | { type: 'validity'; invalid: boolean }
>;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'touch':
      return { ...state, shown: state.invalid };

    case 'validity':
      return {
        shown: state.shown && action.invalid,
        invalid: action.invalid,
      };
  }
};
