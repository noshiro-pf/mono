import {
  Tuple,
  configureStore,
  createAction,
  createSelector,
  isAnyOf,
  lruMemoize,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  type State = Readonly<{
    selector: number;
    branches: readonly number[];
  }>;

  const setBranch =
    createAction<Readonly<{ index: number; value: number }>>(
      'fanOut/setBranch',
    );

  const isSetBranch = isAnyOf(setBranch);

  const initialState: State = {
    selector: 0,
    branches: Arr.zeros(asUint32(branchCount)),
  } as const;

  // A plain reducer rather than `createSlice`: an Immer draft of the `branches`
  // array would be finalized element by element on every update, and that would
  // be measured as Redux's cost.
  const store = configureStore({
    reducer: (
      state: State | undefined,
      action: Readonly<UnknownAction>,
    ): State => {
      const current = state ?? initialState;

      return isSetBranch(action)
        ? {
            ...current,
            branches: current.branches.with(
              action.payload.index,
              action.payload.value,
            ),
          }
        : current;
    },
    middleware: () => new Tuple(),
  });

  // Reads only the branch the selector picks. Every update replaces the
  // `branches` array, so this recomputes on each one — an index lookup.
  const selectResult = createSelector(
    (state: State) => state.selector,
    (state: State) => state.branches,
    (sel, branches) => branches[sel] ?? 0,
    { memoize: lruMemoize },
  );

  let mut_lastValue = selectResult(store.getState());

  store.subscribe(() => {
    mut_lastValue = selectResult(store.getState());
  });

  // Update an INACTIVE branch (branch 1, while selector = 0)
  for (let mut_i = 1; mut_i <= k; mut_i++) {
    store.dispatch(setBranch({ index: 1, value: mut_i }));
  }

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (Redux)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
